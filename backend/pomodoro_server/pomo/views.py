import json
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

from . import helper_cryptography, models

LOGGER = logging.getLogger(name="pomoAPI")


@login_required
def asana_api_key(request) -> JsonResponse:
    """
    Get the API key associated with Asana account.
    Send API key associated with username.
    """
    # Get API key
    if request.method == "POST":
        json_data = json.loads(request.body.decode("utf-8"))
        api_key = json_data.get("api_key", "")

        if not api_key:
            error_msg = f"Can not found API key in request. User: {request.user}."
            LOGGER.warning(error_msg)
            return JsonResponse({"error": "Invalid JSON data."}, status=400)
        try:
            encryptes_key = helper_cryptography.encrypt(plaintext=api_key)
        except Exception as fernet_error:
            msg = f"Can not encrypt plain asana API key with fernet. \
                User: {request.user}, error: {fernet_error}"
            LOGGER.error(msg)
            return JsonResponse({"error": "Invalid request method"}, status=500)
        try:
            # Add key to database
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
        json_data = json.loads(request.body.decode("utf-8"))
        for record in json_data["tasksList"]:
            try:
                # Verify if the task is in the task database. If not, add it to the database.
                tasks = models.Tasks.objects.get_or_create(
                    gid=record["taskId"], name=record["taskName"], user=request.user
                )
                # Add task record to the database.
                models.TaskRecords.objects.create(
                    user=request.user,
                    task=tasks[0],
                    time_spent=record["timeSpent"],
                    date=datetime.now(),
                )
                # Add pomodoro record to the database.
                models.PomoRecords.objects.create(
                    user=request.user,
                    is_full_pomo=(json_data["pomo"]["isFullPomo"]),
                    pomo_in_row_count=json_data["pomo"]["pomoInRow"],
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
    except json.JSONDecodeError as error:
        # Handle JSON decoding errors.
        LOGGER.error("Can not decode pomo records JSON: %s", error)
        return JsonResponse({"error": "Invalid JSON data"}, status=400)


@require_POST
def set_task_complited(request) -> JsonResponse:
    """
    Mark the task as completed in the database
    """
    try:
        json_data: dict = json.loads(request.body.decode("utf-8"))
        task_id = json_data.get("task_id")
        if task_id:
            # Get row from database
            task, created = models.Tasks.objects.update_or_create(
                user=request.user,
                gid=task_id,
                name=json_data["task_name"],
                complited=True,
                default={"complited": True},
            )
            if not created:
                LOGGER.debug("Successfully set task %s as completed", task.name)
            else:
                LOGGER.debug(
                    "Successfully add task and set task %s as completed",
                    task.name,
                )
            return JsonResponse({"success": True})
        LOGGER.error("set_task_complited API error. No task_id in POST request.")
        raise ValueError("Value error in request - can not load JSON with task_id")
    except Exception as e:
        LOGGER.debug("set_task_complited: error: %s", e)
        return JsonResponse(data={"error": "Invalid request."}, status=500)


@require_POST
def login_user(request) -> JsonResponse:
    """
    Login the user
    """

    # Get user credentials
    try:
        json_data: dict = json.loads(request.body.decode("utf-8"))
        username: str = json_data["username"]
        password: str = json_data["password"]
    except Exception as e:
        LOGGER.error(
            "Can not parse login request, %s error: %s",
            request.body.decode("utf-8"),
            e,
        )
        return JsonResponse(data={"error": "Invalid JSON data"}, status=400)
    # Try to validate user
    user = authenticate(request, username=username, password=password)
    if not user:
        LOGGER.debug("Login failed username=%s", username)
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
        json_data = json.loads(request.body.decode("utf-8"))
        username = json_data["username"]
        password = json_data["password"]
        LOGGER.debug("Sign in User: %s, Password: %s", username, password)

    except Exception as e:
        LOGGER.error(
            "Can not parse signin request, %s, error:%s",
            request.body.decode("utf-8"),
            e,
        )
        return JsonResponse({"error": "Invalid JSON data"}, status=400)
    # Add new user to the database
    # TODO sanitation and validation pydantic https://stackoverflow.com/questions/16861/sanitising-user-input-using-python
    try:
        new_user = User.objects.create_user(username=username, password=password)
        login(request, new_user)
        LOGGER.debug("Create new user: %s", username)
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
    date_data = date(date_request[2], date_request[1] + 1, date_request[0])

    # Find the mean and maximum values of time spent each day from all recorded times.
    yearly_time_data_qs = (
        models.TaskRecords.objects.filter(user=request.user)
        .values("date__date")  # Truncate the datetime to get the date
        .annotate(time_sum=Sum("time_spent"))
    )
    try:
        current_time_value = yearly_time_data_qs.get(date__date=date_data)["time_spent"]
    except models.TaskRecords.DoesNotExist:
        current_time_value = 0
    mean_time, max_time = yearly_time_data_qs.aggregate(
        Avg("time_sum"), Max("time_sum")
    ).values()
    json_data["timeGauge"] = [current_time_value, mean_time, max_time]

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
    json_data["pomoGauge"] = [current_pomo_value, mean_pomo, max_pomo]

    # Find Max and Mean pomo_in_row_count
    max_pomo_in_row, mean_pomo_in_row = (
        models.PomoRecords.objects.filter(user=request.user)
        .aggregate(Max("pomo_in_row_count"), Avg("pomo_in_row_count"))
        .values()
    )
    current_pomo_in_row = models.PomoRecords.objects.filter(
        user=request.user, date__date=date_data
    ).aggregate(Max("pomo_in_row_count"))["pomo_in_row_count__max"]
    json_data["pomoInRowGauge"] = [
        current_pomo_in_row,
        mean_pomo_in_row,
        max_pomo_in_row,
    ]

    # Find the daily activities for a particular day.
    daily_data = list(
        (
            models.TaskRecords.objects.select_related("task")
            .filter(user=request.user, date__date=date_data)
            .values("task__name")
            .annotate(spent=Sum("time_spent"))
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
    json_data = {"timeData": {}, "pomoData": {}}

    year_data_time = list(
        models.TaskRecords.objects.filter(user=request.user)
        .values("date__date")
        .annotate(time_spent=Sum("time_spent"))
    )
    for item in year_data_time:
        year = item["date__date"].year
        if year not in json_data["timeData"]:
            json_data["timeData"][year] = [[item["date__date"].day, item["time_spent"]]]
        else:
            json_data["timeData"][year].append(
                [item["date__date"].day, item["time_spent"]]
            )

    year_data_pomo = (
        models.PomoRecords.objects.filter(user=request.user, is_full_pomo=True)
        .values("date__date")
        .annotate(pomo_count=Count("is_full_pomo"))
    )
    for item in year_data_pomo:
        year = item["date__date"].year
        if year not in json_data["pomoData"]:
            json_data["pomoData"][year] = [[item["date__date"].day, item["pomo_count"]]]
        else:
            json_data["pomoData"][year].append(
                [item["date__date"].day, item["pomo_count"]]
            )

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
        .annotate(time_spent=Sum("time_spent"))
    )

    json_data["timeData"] = [
        [item["date__date"].isoformat(), item["time_spent"]] for item in task_time_data
    ]

    return JsonResponse(json_data)
