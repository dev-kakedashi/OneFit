from datetime import datetime

from pydantic import BaseModel


class WorkoutCreateRequest(BaseModel):
    workout_name: str
    burned_calories: int
    worked_out_at: datetime
    memo: str | None = None


class WorkoutUpdateRequest(BaseModel):
    workout_name: str
    burned_calories: int
    worked_out_at: datetime
    memo: str | None = None
