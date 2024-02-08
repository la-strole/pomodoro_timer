import logging
from datetime import date, datetime

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core.exceptions import MultipleObjectsReturned, ValidationError
from django.db import IntegrityError
from django.db.models import Avg, Count, Max, Sum
from django.http.response import JsonResponse
from django.shortcuts import get_object_or_404
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
    # Get API key.
    if request.method == "POST":
        try:
            api_key: str = validation.AsanaApiKey.model_validate_json(
                request.body.decode("utf-8")
            ).api_key
        except ValidationError as e:
            error_msg = f"API key validation error. User: {request.user}. Error: {e}"
            LOGGER.warning(error_msg)
            return JsonResponse({"error": "Invalid JSON data."}, status=400)
        try:
            encryptes_key = helper_cryptography.encrypt(plaintext=api_key)
        except TypeError as fernet_error:
            msg = f"Can not encrypt plain asana API key with fernet. \
                User: {request.user}, error: {fernet_error}"
            LOGGER.error(msg)
            return JsonResponse({"error": "Invalid Asana PAT"}, status=500)
        try:
            # Add key to the database.
            models.AsanaApiKey.objects.create(api_key=encryptes_key, user=request.user)
            LOGGER.debug("Successfully add API key for user %s", request.user)
            return JsonResponse({"success": "JSON data processed successfully"})
        except (IntegrityError, ValidationError, TypeError) as database_error:
            error_msg = f"Can not save Asana API key to database. \
                             User:{request.user} , error: {database_error}"

            LOGGER.error(error_msg)
            return JsonResponse({"error": "Invalid request method"}, status=500)

    elif request.method == "GET":
        # Send API key to user
        record = get_object_or_404(models.AsanaApiKey, user=request.user)
        encrypted_api_key = record.api_key
        try:
            plain_api_key = helper_cryptography.decrypt(encrypted_api_key)
        except Exception as fernet_error:
            msg = f"Can not decrypt asana API key with fernet. \
                    User:{request.user} , error: {fernet_error}"
            LOGGER.error(msg)
            return JsonResponse({"error": "Invalid request"}, status=500)
        json_dict = {"api_key": plain_api_key}
        response = JsonResponse(json_dict, status=200, safe=True)
        return response

    error_msg = "Invalid request method"
    LOGGER.error(error_msg)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@login_required
@require_POST
def pomo_records(request) -> JsonResponse:
    """
    Retrieve or send Pomodoro records from the client.
    """

    try:
        json_data = validation.PomoRecord.model_validate_json(
            request.body.decode("utf-8")
        )
    except PydanticValidationError as e:
        msg = f"Invalid request. pomo record validation error: {e}"
        LOGGER.error(msg)
        return JsonResponse({"error": "Invalid request"}, status=400)

    for record in json_data.tasksList:
        try:
            # Verify if the task is in the task database. If not, add it to the database.
            tasks = models.Tasks.objects.get_or_create(
                gid=record.taskId, name=record.taskName, user=request.user
            )
            # Add task record to the database.
            models.TaskRecords.objects.create(
                user=request.user,
                task=tasks[0],
                time_spent=record.timeSpent,
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
                "pomo_records: Database error while get or create task or task record: %s",
                database_error,
            )
            return JsonResponse({"error": "Invalid request"}, status=500)

    return JsonResponse({"message": "pomo record JSON data processed successfully"})


@require_POST
def set_task_complited(request) -> JsonResponse:
    """
    Mark the task as completed in the database.
    """

    try:
        json_data = validation.TaskComplitedAPI.model_validate_json(
            request.body.decode("utf-8")
        )
    except PydanticValidationError as e:
        msg = f"Task Complited record validation error: user: {request.user}, {e}"
        LOGGER.warning(msg)
        return JsonResponse({"error": "Invalid request"}, status=500)

    # Get row from database
    try:
        task, created = models.Tasks.objects.update_or_create(
            user=request.user,
            gid=json_data.task_id,
            name=json_data.task_name,
            complited=True,
            default={"complited": True},
        )
    except (
        MultipleObjectsReturned,
        IntegrityError,
        ValidationError,
        TypeError,
    ) as e:
        msg = (
            f"Database error while setting task as complite. user: {request.user}, {e}"
        )
        LOGGER.warning(msg)
        return JsonResponse({"error": "Invalid request"}, status=500)

    if not created:
        LOGGER.debug("Successfully set task %s as completed", task.name)
    else:
        LOGGER.debug(
            "Successfully add task and set task %s as completed",
            task.name,
        )
    return JsonResponse({"success": True})


@require_POST
def login_user(request) -> JsonResponse:
    """
    Login the user
    """

    # Get user credentials
    try:
        json_data = validation.UserAPI.model_validate_json(request.body.decode("utf-8"))
    except PydanticValidationError as e:
        LOGGER.error(
            "Can not parse login request, %s error: %s",
            request.body.decode("utf-8"),
            e,
        )
        return JsonResponse(data={"error": "Invalid JSON data"}, status=400)
    # Try to validate user
    user = authenticate(
        request, username=json_data.username, password=json_data.password
    )
    if not user:
        LOGGER.debug("Login failed username=%s", json_data.username)
        return JsonResponse({"error": "Invalid authentification attempt"}, status=401)

    login(request, user)
    LOGGER.debug("Successfully log in user: %s", request.user)
    return JsonResponse({"success": "Successfully login"})


@require_POST
def signin_user(request) -> JsonResponse:
    """
    Sign in a user
    """

    # Get user credentials
    try:
        json_data = validation.UserAPI.model_validate_json(request.body.decode("utf-8"))
        LOGGER.debug(
            "Sign in User: %s, Password: %s", json_data.username, json_data.password
        )

    except PydanticValidationError as e:
        LOGGER.error(
            "Can not parse signin request, %s, error:%s",
            request.body.decode("utf-8"),
            e,
        )
        return JsonResponse({"error": "Invalid JSON data"}, status=400)
    # Add new user to the database.
    try:
        new_user = User.objects.create_user(
            username=json_data.username, password=json_data.password
        )
        login(request, new_user)
        LOGGER.debug("Create new user: %s", json_data.username)
        return JsonResponse({"success": f"Create new user: {new_user.username}"})
    except Exception as e:
        LOGGER.error("Can not create new user: %s", e)
        return JsonResponse({"error": "Invalid user credentials"}, status=400)


@ensure_csrf_cookie
def get_csrf_token(request) -> JsonResponse:
    """
    Return CSRF token as cookie
    """
    LOGGER.debug("Send csrf token in cookies")
    return JsonResponse({"success": "Send CSRF token"})


@require_GET
def logout_user(request) -> JsonResponse:
    """
    Logout user
    """
    if not request.user.is_authenticated:
        LOGGER.debug("Anauthorization attempt to logout. uesr: %s", request.user)
        return JsonResponse({"error": "You are not logged in"}, status=400)

    LOGGER.debug("Successfully logout user: %s", request.user)
    logout(request)

    return JsonResponse({"success": "Successfully logged out"})


@require_GET
def whoami(request) -> JsonResponse:
    """
    Return if user is authenticated
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
    # Retrieve the date from the GET request.
    date_request = request.GET.get("date", "")
    # Convert the date string to a Python date object.
    date_request = date_request.split("-")
    date_data = date(
        int(date_request[2]), int(date_request[1]) + 1, int(date_request[0])
    )

    # Find the mean and maximum values of time spent each day from all recorded times.
    yearly_time_data_qs = (
        models.TaskRecords.objects.filter(user=request.user)
        .values("date__date")  # Truncate the datetime to get the date
        .annotate(time_sum=(Sum("time_spent") / 60))
    )
    try:
        current_time_value = yearly_time_data_qs.get(date__date=date_data)["time_sum"]
    except models.TaskRecords.DoesNotExist:
        current_time_value = 0
    mean_time, max_time = yearly_time_data_qs.aggregate(
        Avg("time_sum"), Max("time_sum")
    ).values()
    json_data["timeGauge"] = [current_time_value, round(mean_time), max_time]

    # Find the mean and maximum values of pomodoro from each day from all recorded times.
    yearly_pomo_data_qs = (
        models.PomoRecords.objects.filter(user=request.user, is_full_pomo=True)
        .values("date__date")
        .annotate(pomo_count=Count("is_full_pomo"))
    )
    try:
        current_pomo_value = yearly_pomo_data_qs.get(date__date=date_data)["pomo_count"]
    except models.PomoRecords.DoesNotExist:
        current_pomo_value = 0
    mean_pomo, max_pomo = yearly_pomo_data_qs.aggregate(
        Avg("pomo_count"), Max("pomo_count")
    ).values()
    json_data["pomoGauge"] = [current_pomo_value, round(mean_pomo), max_pomo]

    # Find Max and Mean pomo_in_row_count
    max_pomo_in_row, mean_pomo_in_row = (
        models.PomoRecords.objects.filter(user=request.user)
        .aggregate(Max("pomo_in_row_count"), Avg("pomo_in_row_count"))
        .values()
    )
    current_pomo_in_row = models.PomoRecords.objects.filter(
        user=request.user, date__date=date_data
    ).aggregate(Max("pomo_in_row_count"))["pomo_in_row_count__max"]
    if not current_pomo_in_row:
        current_pomo_in_row = 0
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
    json_data["donateChart"] = [list(dict_item.values()) for dict_item in daily_data]

    return JsonResponse(json_data)


@login_required
@require_GET
def yearly_chart(request) -> JsonResponse:
    """
    Provide JSON data for yearly activities on Google Charts in the frontend.
    """
    json_data = {}

    year_data_time = list(
        models.TaskRecords.objects.filter(user=request.user)
        .values("date__date")
        .annotate(time_spent=Sum("time_spent") / 60)
    )
    for item in year_data_time:
        date_str = item["date__date"].isoformat()
        json_data[date_str] = {"time": item["time_spent"], "pomo": 0}

    year_data_pomo = (
        models.PomoRecords.objects.filter(user=request.user, is_full_pomo=True)
        .values("date__date")
        .annotate(pomo_count=Count("is_full_pomo"))
    )
    for item in year_data_pomo:
        date_str = item["date__date"].isoformat()
        if date_str in json_data:
            json_data[date_str]["pomo"] = item["pomo_count"]
        else:
            json_data[date_str] = {"time": 0, "pomo": item["pomo_count"]}

    return JsonResponse(json_data)


@login_required
@require_GET
def task_chart(request) -> JsonResponse:
    """
    Provide JSON data for task activities on Google Charts in the frontend.
    """
    gid = request.GET.get("gid")
    json_data = {}

    task_time_data = list(
        models.TaskRecords.objects.select_related("task")
        .filter(task__gid=gid)
        .values("date__date")
        .annotate(time_spent=Sum("time_spent") / 60)
    )

    json_data["timeData"] = [
        [item["date__date"].isoformat(), item["time_spent"]] for item in task_time_data
    ]

    return JsonResponse(json_data)


@login_required
@require_GET
def get_task_list(request) -> JsonResponse:
    """
    Return a list of tasks for a user
    """
    result = list(
        models.Tasks.objects.filter(user=request.user)
        .order_by("name")
        .values("gid", "name")
    )
    return JsonResponse({"taskList": result})
