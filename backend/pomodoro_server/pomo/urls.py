from django.urls import path

from . import views

urlpatterns = [
    path(route="asana", view=views.asana_api_key, name="asana"),
    path(route="pomo", view=views.get_pomo_record, name="pomo"),
    path(route="auth/login", view=views.login_user, name="login_user"),
    path(route="auth/signin", view=views.signin_user, name="signin_user"),
    path(route="auth/get_csrf_token", view=views.get_csrf_token, name="get_csrf_token"),
    path(route="auth/logout", view=views.logout_user, name="logout_user"),
    path(route="auth/whoami", view=views.whoami, name="whoami"),
]
