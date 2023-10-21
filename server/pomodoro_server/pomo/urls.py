from django.urls import path

from . import views

urlpatterns = [
    path(route="asana", view=views.asana_api_key, name="asana"),
    path(route="pomo", view=views.get_pomo_record, name="pomo"),
]
