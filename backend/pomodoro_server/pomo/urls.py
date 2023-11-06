from django.urls import path

from . import views

urlpatterns = [
    path(route="asana", view=views.asana_api_key, name="asana"),
    path(route="pomo", view=views.get_pomo_record, name="pomo"),
    path(route="auth/login", view=views.login_user, name="login_user"),
    path(route="auth/signin", view=views.signin_user, name="signin_user"),
    path(route="auth/csrf", view=views.csrf_token, name="csrf_token"),
]
