"""
Pydantic data validation.
"""

from typing import List

from pydantic import BaseModel, Field, field_validator


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
    Validate Task record in pomo record tasks.
    """

    taskId: str

    @field_validator("taskId")
    @classmethod
    def is_int_or_null(cls, v):
        """
        If task id in integer or 'null'
        """
        try:
            assert int(v) > 0
            return v
        except ValueError:
            assert v == "null"
            return v

    taskName: str

    @field_validator("taskName")
    @classmethod
    def update_empty_name(cls, v):
        """ "
        Check if task name gt 0 or upadte empty task name
        """
        return v if v else "--------"

    timeSpent: int = Field(gt=0)


class PomoRecordPomo(BaseModel):
    """
    Validate Pomo in pomo record tasks.
    """

    isFullPomo: bool
    pomoInRow: int = Field(ge=0)


class TaskComplitedAPI(BaseModel):
    """
    Validate Task comlited record.
    """

    task_id: str

    @field_validator("task_id")
    @classmethod
    def is_int_or_null(cls, v):
        """
        If task id in integer or 'null'
        """
        try:
            assert int(v) > 0
            return v
        except ValueError:
            assert v == "null"
            return v

    task_name: str

    @field_validator("task_name")
    @classmethod
    def update_empty_name(cls, v):
        """ "
        Check if task name gt 0 or upadte empty task name
        """
        return v if v else "--------"


class UserAPI(BaseModel):
    """
    Validate User record
    """

    username: str = Field(min_length=1)
    password: str = Field(min_length=1)
