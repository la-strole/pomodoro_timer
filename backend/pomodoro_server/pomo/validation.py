"""
Pydantic data validation.
"""

from datetime import date
from typing import Dict, List, Literal, Union

from pydantic import BaseModel, Field, PositiveInt, field_validator


class AsanaApiKey(BaseModel):
    """
    Asana API tokens should be treated as opaque. Token formats may change without notice.
    https://developers.asana.com/docs/personal-access-token
    """

    api_key: str = Field(min_length=1)


class PomoRecord(BaseModel):
    """
    Validate Pomodoro records from the client.
    """

    pomo: "PomoRecordPomo"
    tasksList: List["PomoRecordTask"]


class PomoRecordTask(BaseModel):
    """
    Validate the task field within the Pomodoro record.
    """

    taskId: Union[PositiveInt, Literal["null"]]

    taskName: str

    @field_validator("taskName")
    @classmethod
    def update_empty_name(cls, v):
        """ "
        Check if the task name has more than 0 characters,
        or update it to an empty task name.
        """
        return v if v else "--------"

    timeSpent: PositiveInt


class PomoRecordPomo(BaseModel):
    """
    Validate the pomo field within the Pomodoro record.
    """

    isFullPomo: bool
    pomoInRow: int

    @field_validator("pomoInRow")
    @classmethod
    def ge_zero(cls, v):
        """
        Validate the pomoInRow field >= 0.
        """
        assert v >= 0
        return v


class TaskComplitedAPI(BaseModel):
    """
    Validate the completed task record.
    """

    task_id: Union[PositiveInt, Literal["null"]]

    task_name: str

    @field_validator("task_name")
    @classmethod
    def update_empty_name(cls, v):
        """ "
        Check if the task name has more than 0 characters,
        or update it to an empty task name.
        """
        return v if v else "--------"


class UserAPI(BaseModel):
    """
    Validate the user record.
    """

    username: str = Field(min_length=1)
    password: str = Field(min_length=8)


class DateFromString(BaseModel):
    """
    Validate the daily activities API.
    """

    date: date

    @field_validator("date")
    @classmethod
    def day_in_past_or_today(cls, v):
        """
        Validate that the date is in the past or today.
        """
        assert v <= date.today()
        return v


class DailyActivity(BaseModel):
    """
    Daily activities API.
    """

    donateChart: List[List[Union[str, int]]]

    @field_validator("donateChart")
    @classmethod
    def validate_donate_chart(cls, v):
        """
        Validate the donate chart.
        """
        for name, time in v:
            assert isinstance(name, str)
            assert isinstance(time, int)
            assert time >= 0
            assert name
        return v

    pomoGauge: List[int]
    timeGauge: List[int]
    pomoInRowGauge: List[int]

    @field_validator("pomoGauge", "timeGauge", "pomoInRowGauge")
    @classmethod
    def validate_pomo_gauge(cls, v):
        """
        Validate the donate chart.
        """
        assert len(v) == 3
        for item in v:
            assert item >= 0
        return v


class YearlyChart(BaseModel):
    """
    Validate JSON data for yearly activities on Google Charts in the frontend.
    """

    json_object: Dict[date, Dict[Literal["time", "pomo"], int]]


class TaskChart(BaseModel):
    """
    Validate JSON data for task chart on Google Charts in the frontend.
    """

    timeData: List[List[Union[date, int]]]


class GetTaskListAPI(BaseModel):
    """
    Validate JSON data for the task list specific to a user.
    """

    taskList: List[Dict[Literal["gid", "name"], str]]


class TaskId(BaseModel):
    """
    Validate the task.
    """

    taskId: Union[PositiveInt, Literal["null"]]
