import json
import logging
from datetime import datetime

from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http.response import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie

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
        api_key = request.POST.get("api_key", "")

        if not api_key:
            error_msg = f"Can not found API key in request. User: {request.user}."
            LOGGER.error(error_msg)
            return JsonResponse({"error": "Invalid JSON data."}, status=400)

        #  TODO Add check for API key
        try:
            encryptes_key = helper_cryptography.encrypt(plaintext=api_key)
        except Exception as fernet_error:
            msg = f"Can not encrypt plain asana API key with fernet. \
                User: {request.user}, error: {fernet_error}"
            LOGGER.error(msg)
            return JsonResponse({"error": "Invalid request method"}, status=500)

        # Add key to database
        asana_api = models.AsanaApiKey()
        asana_api.api_key = encryptes_key
        asana_api.user = request.user
        try:
            asana_api.save()
            LOGGER.debug("Successfully add API key for user %s", request.user)
            return JsonResponse({"message": "JSON data processed successfully"})

        except Exception as database_error:
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
def get_pomo_record(request) -> JsonResponse:
    """
    Get pomo record from client.
    """
    if request.method == "POST":
        try:
            json_data = json.loads(request.body.decode("utf-8"))
            LOGGER.debug(json_data)

            # TODO add validators here
            # Check if task in task database. If not - add it to database.
            try:
                task = models.Tasks.objects.filter(gid=json_data["task"]["task_gid"])
                if not task:
                    date_format = "%Y-%m-%d %H:%M:%S"
                    task_record = models.Tasks(
                        gid=json_data["task"]["task_gid"],
                        name=json_data["task"]["task_name"],
                        complited=(json_data["task"]["complited"] == "True"),
                        created_at=datetime.strptime(
                            json_data["task"]["created_at"], date_format
                        ),
                    )
                    task_record.save()
            except Exception as task_error:
                msg = f"Error with task operations. {task_error}"
                LOGGER.error(msg)
                return JsonResponse({"error": "Invalid request"}, status=500)

            # Add pomo record to database
            try:
                task_record = models.Tasks.objects.get(
                    gid=json_data["task"]["task_gid"]
                )
                pomo_record = models.PomoRecords(
                    user=request.user,
                    task=task_record,
                    time_spent=json_data["pomo_records"]["time_spent"],
                    is_full_pomo=(json_data["pomo_records"]["full_pomo"] == "True"),
                    pomo_in_row_count=json_data["pomo_records"]["pomo_in_row"],
                )
                pomo_record.save()
            except Exception as pomo_error:
                msg = f"Error with pomo operations {pomo_error}"
                LOGGER.error(msg)
                return JsonResponse({"error": "Invalid request"}, status=500)

            return JsonResponse({"message": "JSON data processed successfully"})

        except json.JSONDecodeError as error:
            # Handle JSON decoding errors
            LOGGER.error("Can not decode pomo records JSON: %s", error)
            return JsonResponse({"error": "Invalid JSON data"}, status=400)

    elif request.method == "GET":
        # Get pomo data from database
        pomo_records = models.PomoRecords.objects.filter(user=request.user)
        json_data = []
        for record in pomo_records:
            json_string = {"pomo_records": {}, "task": {}}
            json_string["pomo_records"]["time_spent"] = record.time_spent
            json_string["pomo_records"]["full_pomo"] = record.is_full_pomo
            json_string["pomo_records"]["pomo_in_row"] = record.pomo_in_row_count
            if record.task:
                json_string["task"]["name"] = record.task.name
                json_string["task"]["complited"] = record.task.complited
                json_string["task"]["created_at"] = record.task.created_at
            json_data.append(json_string)
        return JsonResponse(json_data, safe=False)

    else:
        LOGGER.error("Invalid client request method: %s", request.method)
        return JsonResponse({"error": "Invalid request method"}, status=405)


def login_user(request) -> JsonResponse:
    """
    Login the user
    """
    if request.method == "POST":
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
            return JsonResponse(
                {"error": "Invalid authentification attempt"}, status=401
            )

        login(request, user)
        return JsonResponse({"success": ""})

    LOGGER.error("Got invalid login request method: %s", request.method)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def signin_user(request) -> JsonResponse:
    """
    Sign in a user
    """
    if request.method == "POST":
        # Get user credentials
        try:
            json_data = json.loads(request.body.decode("utf-8"))
            username = json_data["username"]
            password = json_data["password"]
            LOGGER.debug("User: %s, Password: %s", username, password)
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
            return JsonResponse({"success": new_user.username})
        except Exception as e:
            LOGGER.error("Can not create new user: %s", e)
            return JsonResponse({"error": "Invalid user credentials"}, status=400)

    LOGGER.error("Got invalid signin request method: %s", request.method)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@ensure_csrf_cookie
def csrf_token(request) -> JsonResponse:
    """
    Return CSRF token as cookie
    """
    return JsonResponse({"success": ""})
