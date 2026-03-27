from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class WorkoutCreateRequest(BaseModel):
    workout_name: str
    burned_calories: int = Field(..., ge=0)
    worked_out_at: datetime
    memo: str | None = None

    @field_validator("workout_name")
    @classmethod
    def validate_workout_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("workout_name must not be blank")
        return value


class WorkoutUpdateRequest(BaseModel):
    workout_name: str
    burned_calories: int = Field(..., ge=0)
    worked_out_at: datetime
    memo: str | None = None

    @field_validator("workout_name")
    @classmethod
    def validate_workout_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("workout_name must not be blank")
        return value
