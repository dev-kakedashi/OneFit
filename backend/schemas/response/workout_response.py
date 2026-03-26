from datetime import datetime

from pydantic import BaseModel


class WorkoutResponse(BaseModel):
    id: int
    workout_name: str
    burned_calories: int
    worked_out_at: datetime
    memo: str | None

    class Config:
        from_attributes = True
