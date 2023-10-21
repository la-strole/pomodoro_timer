from django.contrib.auth import urls
from django.urls import include, path

from . import views

urlpatterns = [
    path("", include(urls)),
    path("signin", views.signin_view, name="signin"),
]
