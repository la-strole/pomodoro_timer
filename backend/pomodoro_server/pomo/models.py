import uuid

from django.contrib.auth.models import User
from django.db import models


# Create your models here.
class Tasks(models.Model):
    """
    A list of tasks from the Asana
    """

    gid = models.CharField(
        verbose_name="Task ID",
        name="gid",
        primary_key=True,
        help_text="Globally unique identifier of the resource, as a string.",
        max_length=128,
    )

    name = models.CharField(
        verbose_name="Task name", name="name", max_length=128, blank=False
    )

    complited = models.BooleanField(
        verbose_name="Is task complited",
        name="complited",
        blank=False,
        default=False,
    )

    def __str__(self) -> str:
        return str(self.name)


class AsanaApiKey(models.Model):
    """
    API list for  Asana users.
    """

    id = models.UUIDField(
        verbose_name="id",
        name="id",
        default=uuid.uuid4(),
        primary_key=True,
        editable=False,
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="asana_api_key",
        related_query_name="asana_api_key",
        blank=False,
    )

    api_key = models.BinaryField(
        verbose_name="Asana API Key",
        name="api_key",
        unique=True,
        blank=False,
    )

    def __str__(self) -> str:
        return f"{self.user}'s Asana API key"


class PomoRecords(models.Model):
    """
    Pomodoro records from client.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4(), editable=False)

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="pomo_records",
        related_query_name="pomo_records",
        blank=False,
    )

    task = models.ForeignKey(
        Tasks,
        null=True,
        on_delete=models.SET_NULL,
        related_name="pomo_records",
        related_query_name="pomo_records",
        blank=True,
    )

    date = models.DateTimeField(
        name="date",
        auto_now=True,
    )

    time_spent = models.PositiveIntegerField(
        verbose_name="spent time",
        name="time_spent",
        blank=False,
        help_text="The amount of time spent on the task in minutes.",
    )

    is_full_pomo = models.BooleanField(
        verbose_name="Is pomodoro full",
        name="is_full_pomo",
        blank=False,
        default=True,
    )

    pomo_in_row_count = models.PositiveIntegerField(
        verbose_name="pomodoro in row current count",
        name="pomo_in_row_count",
        blank=False,
        default=0,
    )

    def __str__(self) -> str:
        return f"Record: {self.user}:{self.task}"
