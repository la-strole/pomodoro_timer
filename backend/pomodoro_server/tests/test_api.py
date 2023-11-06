import json

from django.contrib.auth.models import User
from django.test import TestCase
from pomo.helper_cryptography import decrypt, encrypt
from pomo.models import AsanaApiKey


class TestCryptography(TestCase):
    """
    Test fernet encryption and decryption with fernet for API keys in database.
    """

    def test_encryption_decryption(self) -> None:
        """
        Test encryption and decryption for plain text with fernet in database.
        """
        user = User.objects.create_user(username="testuser", password="testpassword")
        plain_text = "test_api_key"

        encrypted_key = encrypt(plain_text)

        test_database_record = AsanaApiKey(user=user, api_key=encrypted_key)
        test_database_record.save()

        # Get encrypted api key from database
        encrypted_key = AsanaApiKey.objects.get(user=user).api_key

        decrypted_plain_text = decrypt(encrypted_key)

        self.assertEqual(decrypted_plain_text, plain_text)


class TestAsanaAPI(TestCase):
    """
    Test Get and Post API methods for treatment of asana API keys.
    """

    def setUp(self) -> None:
        # Create a user for testing
        self.user = User.objects.create_user(
            username="testuser", password="testpassword"
        )

    def test_post_asana_api_authorized_user(self) -> None:
        """
        Try to post an asana API key with authorized user.
        """
        # Authenticate the test client with the user's credentials
        self.client.login(username="testuser", password="testpassword")
        response = self.client.post(path="/api/asana", data={"api_key": "testkey"})
        self.assertEqual(
            response.status_code,
            200,
            f"Response status code is not 200 ({response.status_code}).",
        )

    def test_post_asana_api_authorized_user_blank_api_key(self) -> None:
        """
        Try to post an asana API key with authorized user with blank API key.
        """
        # Authenticate the test client with the user's credentials
        self.client.login(username="testuser", password="testpassword")
        response = self.client.post(path="/api/asana", data={"api_key": ""})
        self.assertEqual(
            response.status_code,
            400,
            f"Response status code is not 400 ({response.status_code}).",
        )

    def test_post_asana_api_authorized_user_without_api_key(self) -> None:
        """
        Try to post an asana API key with authorized user without API key.
        """
        # Authenticate the test client with the user's credentials
        self.client.login(username="testuser", password="testpassword")
        response = self.client.post(
            path="/api/asana", data={"not_api_key": "some text"}
        )
        self.assertEqual(
            response.status_code,
            400,
            f"Response status code is not 400 ({response.status_code}).",
        )

    def test_post_asana_api_authorized_user_with_already_saved_api(self) -> None:
        """
        Try to make POST request as authorized user with already saved API key.
        """
        # Authenticate the test client with the user's credentials
        self.client.login(username="testuser", password="testpassword")
        response = self.client.post(path="/api/asana", data={"api_key": "NEW_testkey"})
        self.assertEqual(
            response.status_code,
            200,
            f"Response status code is not 200 ({response.status_code}).",
        )

    def test_post_asana_api_unauthorized_user(self) -> None:
        """
        Try to make POST request as unauthorized user.
        """
        self.client.logout()
        response = self.client.post(path="/api/asana", data={"api_key": "some text"})
        self.assertEqual(
            response.status_code,
            302,
            "Unauthorized user did not redirect to Login page.",
        )

    def test_get_asana_api_authorized_user(self) -> None:
        """
        Get asana API key from authenticated user (user has api key in database).
        """
        # Add encrypted api key to database
        plain_api_key = "test_api_key"
        record = AsanaApiKey(user=self.user, api_key=encrypt(plain_api_key))
        record.save()

        # Authenticate the test client with the user's credentials
        self.client.login(username="testuser", password="testpassword")
        response = self.client.get(path="/api/asana")
        self.assertEqual(
            response.status_code,
            200,
            "Can not get asana API key from authenticated user with GET request.",
        )

        # Get the raw JSON data as bytes from the JsonResponse
        json_data = response.content

        # Parse the JSON data to a Python dictionary
        parsed_data = json.loads(json_data.decode("utf-8"))

        self.assertEqual(parsed_data.get("api_key"), plain_api_key)

    def test_get_asana_api_unauthorized_user(self) -> None:
        """
        Try to get asana API key from unauthenticated user.
        """
        response = self.client.get(path="/api/asana")
        self.assertEqual(
            response.status_code,
            302,
            "Django doesn't redirect unauthorized user to login page.",
        )

    def test_get_asana_api_authorized_user_without_api(self) -> None:
        """
        Try to get asana API with authorized user, \
        but there are not api key for this user in database.
        """
        self.client.login(username="testuser", password="testpassword")
        response = self.client.get(path="/api/asana")
        self.assertEqual(
            response.status_code,
            404,
            f"Unexpected behaviour. If authorized user try to get asana API \
            (but this api doesn't exist in database) \
            django should return 404 error page, but returns {response.status_code}",
        )


class TestPomoRecords(TestCase):
    """
    Test suite for Pomo records tests.
    """

    def setUp(self) -> None:
        # Create a user for testing
        self.user = User.objects.create_user(
            username="testuser", password="testpassword"
        )

        # Create test data for pomo record
        self.data = {
            "task": {
                "task_gid": "100500",
                "task_name": "test_task",
                "complited": "False",
                "created_at": "2023-10-01 14:03:31",
            },
            "pomo_records": {
                "time_spent": "10",
                "full_pomo": "False",
                "pomo_in_row": "1",
            },
        }

    def test_post_pomo_record_unauthenticated_user(self) -> None:
        """
        Try to POST data from unauthenticated user.
        """
        response = self.client.post(path="/api/pomo", data=self.data)
        self.assertEqual(
            response.status_code,
            302,
            "Unexpected behaviour. Django doesn't redirect unauthenticated users "
            f"when they try to post pomo records. Response code = {response.status_code}",
        )

    def test_post_pomo_record_authenticated_user(self) -> None:
        """
        Authenticated user POST pomo records to database.
        """
        self.client.login(username="testuser", password="testpassword")

        json_data = json.dumps(self.data)

        response = self.client.post(
            path="/api/pomo", data=json_data, content_type="application/json"
        )
        self.assertEqual(
            response.status_code,
            200,
            "Unexpected behaviour. Django doesn't POST pomo data from authenticated users "
            f"Response code = {response.status_code}",
        )
        self.assertEqual(
            response.json().get("message"),
            "JSON data processed successfully",
        )

    def test_get_pomo_record_unauthenticated_user(self) -> None:
        """
        Try to get pomo record from database without authentication.
        """
        response = self.client.get(path="/api/pomo")
        self.assertEqual(
            response.status_code,
            302,
            "Unexpected behaviour. Unauthenicated user doesn't redirect to login page.",
        )

    def test_get_pomo_record_authenticated_user(self) -> None:
        """
        Get pomo record from database as JSON string with authenticated uesr.
        """
        self.client.login(username="testuser", password="testpassword")

        response = self.client.get(path="/api/pomo")
        self.assertEqual(
            response.status_code,
            200,
            "Unexpected behaviour. Authenicated user can't get pomo JSON string.",
        )
