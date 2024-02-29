import logging
from datetime import datetime

from cryptography.fernet import InvalidToken
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import (
    get_password_validators,
    validate_password,
)
from django.core.exceptions import MultipleObjectsReturned, ValidationError
from django.db import IntegrityError
from django.db.models import Avg, Count, Max, Sum
from django.http.response import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST
from pydantic import ValidationError as PydanticValidationError

from . import helper_cryptography, models, validation

LOGGER = logging.getLogger(name="pomoAPI")


@login_required
def asana_api_key(request) -> JsonResponse:
    """
    Get the API key associated with Asana account.
    Send API key associated with username.
    """
    if request.method == "POST":
        try:
            # Retrieve data from JSON and validate it.
            api_key: str = validation.AsanaApiKey.model_validate_json(
                request.body.decode("utf-8")
            ).api_key
        except PydanticValidationError as e:
            error_msg = (
                "Error encountered during API key validation."
                f"User: {request.user}. Error: {e}"
            )
            LOGGER.warning(error_msg)
            return JsonResponse(
                {"error": "Invalid JSON data."}, status=400  # Bad request
            )
        try:
            # Encrypt the Asana PAT (Personal Access Token) using Fernet.
            encryptes_key = helper_cryptography.encrypt(plaintext=api_key)
        except TypeError as fernet_error:
            msg = (
                "Unable to encrypt plain Asana API key with Fernet."
                f"User: {request.user}, error: {fernet_error}"
            )
            LOGGER.error(msg)
            return JsonResponse({"error": "Invalid Asana PAT"}, status=500)
        try:
            # Insert the key into the database.
            models.AsanaApiKey.objects.create(api_key=encryptes_key, user=request.user)
            LOGGER.debug("Successfully added API key for user %s.", request.user)
            return JsonResponse({"success": "JSON data processed successfully"})
        except (IntegrityError, ValidationError, TypeError) as database_error:
            error_msg = (
                "Unable to save Asana API key to database."
                f"User:{request.user}, error: {database_error}"
            )
            LOGGER.error(error_msg)
            return JsonResponse({"error": "Invalid asana PAT"}, status=500)

    elif request.method == "GET":
        # Retrieve encrypted Asana PAT from database.
        try:
            record = models.AsanaApiKey.objects.get(user=request.user)
        except (
            models.AsanaApiKey.DoesNotExist,
            models.AsanaApiKey.MultipleObjectsReturned,
        ) as e:
            LOGGER.debug(
                "Can not find Asana API key for user %s error: %s", request.user, e
            )
            return JsonResponse({"error": "Invalid asana PAT"}, status=500)
        encrypted_api_key = record.api_key
        try:
            # Decrypt the Asana PAT with Fernet.
            plain_api_key = helper_cryptography.decrypt(encrypted_api_key)
        except (InvalidToken, TypeError) as fernet_error:
            msg = (
                "Can not decrypt asana API key with fernet."
                f"User:{request.user}, error: {fernet_error}."
            )
            LOGGER.error(msg)
            return JsonResponse({"error": "Invalid asana PAT"}, status=500)

        return JsonResponse({"api_key": plain_api_key})

    error_msg = "Invalid request method."
    LOGGER.error(error_msg)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@login_required
@require_POST
def pomo_records(request) -> JsonResponse:
    """
    Retrieve Pomodoro records from the client.
    """

    try:
        # Retrieve data from JSON and validate it.
        json_data = validation.PomoRecord.model_validate_json(
            request.body.decode("utf-8")
        )
    except PydanticValidationError as e:
        msg = f"Pomodoro record validation error: {e}"
        LOGGER.error(msg)
        return JsonResponse({"error": "Invalid request"}, status=400)

    for task_record in json_data.tasksList:
        try:
            # Verify if the task is in the task database. If not, add it to the database.
            tasks = models.Tasks.objects.get_or_create(
                gid=task_record.taskId, name=task_record.taskName, user=request.user
            )
            # Add task record to the database.
            models.TaskRecords.objects.create(
                user=request.user,
                task=tasks[0],
                time_spent=task_record.timeSpent,
                date=datetime.now(),
            )
            # Add pomodoro record to the database.
            models.PomoRecords.objects.create(
                user=request.user,
                is_full_pomo=(json_data.pomo.isFullPomo),
                pomo_in_row_count=json_data.pomo.pomoInRow,
            )
        except (
            MultipleObjectsReturned,
            IntegrityError,
            ValidationError,
            TypeError,
        ) as database_error:
            LOGGER.error(
                "pomo_records: Database error encountered while attempting to get"
                "or create task or task record: %s",
                database_error,
            )
            return JsonResponse({"error": "Invalid pomodoro record"}, status=500)

    return JsonResponse({"message": "Pomo record JSON data processed successfully"})


@login_required
@require_POST
def set_task_completed(request) -> JsonResponse:
    """
    Mark the task as completed in the database.
    """

    try:
        # Retrieve data from JSON and validate it.
        json_data = validation.TaskComplitedAPI.model_validate_json(
            request.body.decode("utf-8")
        )
    except PydanticValidationError as e:
        msg = f"Task Complited record validation error: user: {request.user}, {e}"
        LOGGER.warning(msg)
        return JsonResponse({"error": "Invalid request JSON object"}, status=500)

    # Retrieve task from the database or create it if it does not exist.
    tasks = models.Tasks.objects.filter(gid=json_data.task_id)
    user_task = tasks.filter(user=request.user)
    if not user_task:
        # Attempt to create the task.
        try:
            models.Tasks.objects.create(
                gid=json_data.task_id,
                name=json_data.task_name,
                completed=True,
                user=request.user,
            )
            LOGGER.debug(
                "Successfully create task %s and marked it as completed.",
                json_data.task_name,
            )
            for task in tasks:
                task.completed = True
                task.save()
            return JsonResponse({"success": True})

        except (IntegrityError, ValidationError, TypeError) as e:
            LOGGER.warning(
                "Database error while creating task as complite. user: %s, task: %s, error: %s",
                request.user,
                json_data.task_name,
                e,
            )
            return JsonResponse({"error": "Invalid request"}, status=500)
    else:
        try:
            for task in tasks:
                task.completed = True
                task.save()
            LOGGER.debug(
                "Successfully marked task %s as completed.", json_data.task_name
            )
            return JsonResponse({"success": True})
        except (IntegrityError, TypeError, ValidationError) as e:
            LOGGER.warning(
                "Database error while setting task as complite. user: %s, task: %s, error: %s",
                request.user,
                json_data.task_name,
                e,
            )
            return JsonResponse({"error": "Invalid request"}, status=500)


@require_POST
def login_user(request) -> JsonResponse:
    """
    Login the user.
    """

    # Get and validate user credentials.
    try:
        json_data = validation.UserAPI.model_validate_json(request.body.decode("utf-8"))
    except PydanticValidationError as e:
        LOGGER.error(
            "Can not parse login request, %s error: %s",
            request.body.decode("utf-8"),
            e,
        )
        return JsonResponse(data={"error": "Invalid JSON data"}, status=400)
    # Try to validate user.
    user = authenticate(
        request, username=json_data.username, password=json_data.password
    )
    if not user:
        LOGGER.debug("Login failed. Username=%s.", json_data.username)
        return JsonResponse(
            {"error": "Invalid authentification attempt"}, status=401  # Unauthorized
        )
    login(request, user)
    LOGGER.debug("Successfully log in user: %s.", request.user)
    return JsonResponse({"success": "Successfully login"})


@require_POST
def signin_user(request) -> JsonResponse:
    """
    Sign in a user.
    """

    # Get and validate user credentials.
    try:
        json_data = validation.UserAPI.model_validate_json(request.body.decode("utf-8"))
    except PydanticValidationError as e:
        LOGGER.error("Can not parse signin request, error:%s", e)
        return JsonResponse({"error": "Invalid JSON data"}, status=400)
    # Add a new user to the database.
    # Validate password.
    try:
        validate_password(
            json_data.password,
            password_validators=get_password_validators(
                settings.AUTH_PASSWORD_VALIDATORS
            ),
        )
    except ValidationError as e:
        LOGGER.error("Unable to create a new user: password validation error: %s", e)
        return JsonResponse({"error": e.message_dict}, status=400)
    try:
        new_user = User.objects.create_user(
            username=json_data.username, password=json_data.password
        )
        # Log in new user.
        login(request, new_user)
        LOGGER.debug("User successfully created: %s.", json_data.username)
        return JsonResponse(
            {"success": f"User successfully created: {new_user.username}"}
        )
    except Exception as e:
        LOGGER.error("Unable to create a new user: %s", e)
        return JsonResponse({"error": "Invalid user credentials"}, status=400)


@ensure_csrf_cookie
def get_csrf_token(request) -> JsonResponse:
    """
    Return CSRF token as cookie.
    """
    LOGGER.debug("Send the CSRF token in cookies.")
    return JsonResponse({"success": "Send CSRF token"})


@login_required
@require_GET
def logout_user(request) -> JsonResponse:
    """
    Logout user.
    """
    if not request.user.is_authenticated:
        LOGGER.debug("Unauthorized attempt to logout. User: %s", request.user)
        return JsonResponse({"error": "You are not logged in"}, status=400)

    logout(request)
    LOGGER.debug("Successfully logout user: %s.", request.user)

    return JsonResponse({"success": "Successfully logged out"})


@require_GET
def whoami(request) -> JsonResponse:
    """
    Return whether the user is authenticated.
    """
    if request.user.is_authenticated:
        return JsonResponse({"status": "auth", "username": f"{request.user}"})
    return JsonResponse({"status": "not_auth"})


@login_required
@require_GET
def daily_activities(request) -> JsonResponse:
    """
    Provide JSON data for daily activities on Google Charts in the frontend.
    """
    json_data = {}

    # Retrieve and validate the date from the GET request.
    try:
        date_data = validation.DateFromString(date=request.GET.get("date", "")).date
    except PydanticValidationError as e:
        LOGGER.warning("Daily activities date validation error: %s", e)
        return JsonResponse({"error": "Invalid date in GET request"}, status=400)

    # Retrieve an array of summary daily time.
    yearly_time_data_qs = (
        models.TaskRecords.objects.filter(user=request.user)
        .values("date__date")  # Truncate the datetime to get the date
        .annotate(time_sum=Sum("time_spent") / 60)
    )
    # Retrieve the time spent on a specific day.
    try:
        current_time_value = yearly_time_data_qs.get(date__date=date_data)["time_sum"]
    except models.TaskRecords.DoesNotExist:
        current_time_value = 0
    # Retrieve the mean and maximum time spent in a day.
    mean_time, max_time = yearly_time_data_qs.aggregate(
        Avg("time_sum"), Max("time_sum")
    ).values()
    # Append data to a JSON object for time gauge.
    json_data["timeGauge"] = [current_time_value, round(mean_time), max_time]

    # Retrieve an array of summary daily pomo.
    yearly_pomo_data_qs = (
        models.PomoRecords.objects.filter(user=request.user, is_full_pomo=True)
        .values("date__date")
        .annotate(pomo_count=Count("is_full_pomo"))
    )
    # Retrieve the pomodoro count on a specific day.
    try:
        current_pomo_value = yearly_pomo_data_qs.get(date__date=date_data)["pomo_count"]
    except models.PomoRecords.DoesNotExist:
        current_pomo_value = 0
    # Retrieve the mean and maximum pomo count spent in a day.
    mean_pomo, max_pomo = yearly_pomo_data_qs.aggregate(
        Avg("pomo_count"), Max("pomo_count")
    ).values()
    # Append data to a JSON object for pomo gauge.
    mean_pomo = mean_pomo if mean_pomo else 0
    max_pomo = max_pomo if max_pomo else 0
    json_data["pomoGauge"] = [current_pomo_value, round(mean_pomo), max_pomo]

    # Find the maximum and mean Pomodoro count in a row.
    max_pomo_in_row, mean_pomo_in_row = (
        models.PomoRecords.objects.filter(user=request.user)
        .aggregate(Max("pomo_in_row_count"), Avg("pomo_in_row_count"))
        .values()
    )
    # Retrieve the Pomodoro in a row count for a specific day.
    current_pomo_in_row = models.PomoRecords.objects.filter(
        user=request.user, date__date=date_data
    ).aggregate(Max("pomo_in_row_count"))["pomo_in_row_count__max"]
    if not current_pomo_in_row:
        current_pomo_in_row = 0
    # Append data to a JSON object for pomo in row gauge.
    json_data["pomoInRowGauge"] = [
        current_pomo_in_row,
        round(mean_pomo_in_row),
        max_pomo_in_row,
    ]

    # Find the daily activities for a particular day.
    daily_data = list(
        (
            models.TaskRecords.objects.select_related("task")
            .filter(user=request.user, date__date=date_data)
            .values("task__name")
            .annotate(spent=Sum("time_spent") / 60)
        )
    )
    # Append data to a JSON object for donate chart.
    json_data["donateChart"] = [list(dict_item.values()) for dict_item in daily_data]

    # Validate the data.
    try:
        validation.DailyActivity.model_validate(json_data)
    except PydanticValidationError as e:
        LOGGER.error("DailyActivity model validation error %s", e)
        return JsonResponse({"error": "Invalid data"}, status=500)
    return JsonResponse(json_data)


@login_required
@require_GET
def yearly_chart(request) -> JsonResponse:
    """
    Provide JSON data for yearly activities on Google Charts in the frontend.
    """
    json_data = {}

    # Receive the time spent for each day.
    year_data_time = list(
        models.TaskRecords.objects.filter(user=request.user)
        .values("date__date")
        .annotate(time_spent=Sum("time_spent") / 60)
    )

    # Append time data to the JSON.
    for item in year_data_time:
        date_str = item["date__date"].isoformat()
        json_data[date_str] = {"time": item["time_spent"], "pomo": 0}

    # Receive the Pomodoro count for each day.
    year_data_pomo = (
        models.PomoRecords.objects.filter(user=request.user, is_full_pomo=True)
        .values("date__date")
        .annotate(pomo_count=Count("is_full_pomo"))
    )

    # Append pomo data to the JSON.
    # If there is time spent on a day where Pomodoro is counted, update the time spent.
    for item in year_data_pomo:
        date_str = item["date__date"].isoformat()
        if date_str in json_data:
            json_data[date_str]["pomo"] = item["pomo_count"]
        else:
            json_data[date_str] = {"time": 0, "pomo": item["pomo_count"]}

    # Validate the json data
    try:
        validation.YearlyChart(json_object=json_data)
    except PydanticValidationError as e:
        LOGGER.debug(
            "Validation error encountered with the output JSON for the yearly chart. %s",
            e,
        )
        return JsonResponse({"error": "Invalid request"}, status=500)
    return JsonResponse(json_data)


@login_required
@require_GET
def task_chart(request) -> JsonResponse:
    """
    Provide JSON data for task activities on Google Charts in the frontend.
    """
    # Receive and validate the task name from the GET request.
    try:
        gid = validation.TaskId(taskId=request.GET.get("gid")).taskId
    except PydanticValidationError as e:
        LOGGER.debug(
            "Validation error encountered with the task gid. %s",
            e,
        )
        return JsonResponse({"error:": "Invalid request"}, status=400)

    json_data = {}

    # Receive information for a specific task from the database.
    task_time_data = list(
        models.TaskRecords.objects.select_related("task")
        .filter(task__gid=gid)
        .values("date__date")
        .annotate(time_spent=Sum("time_spent") / 60)
    )

    json_data["timeData"] = [
        [item["date__date"].isoformat(), item["time_spent"]] for item in task_time_data
    ]

    # Validate the json data.
    try:
        validation.TaskChart.model_validate(json_data)
    except PydanticValidationError as e:
        LOGGER.debug(
            "Validation error encountered with the output JSON for the task chart. %s",
            e,
        )
        return JsonResponse({"error": "Invalid request"}, status=500)

    return JsonResponse(json_data)


@login_required
@require_GET
def get_task_list(request) -> JsonResponse:
    """
    Provide a list of tasks for a user.
    """
    result = list(
        models.Tasks.objects.filter(user=request.user)
        .order_by("name")
        .values("gid", "name")
    )

    json_data = {"taskList": result}

    # Validate the json data.
    try:
        validation.GetTaskListAPI.model_validate(json_data)
    except PydanticValidationError as e:
        LOGGER.debug(
            "Validation error encountered with the output JSON for the task list. %s",
            e,
        )
        return JsonResponse({"error": "Invalid request"}, status=500)

    return JsonResponse(json_data)
