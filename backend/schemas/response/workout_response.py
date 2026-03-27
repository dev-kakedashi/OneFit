from datetime import datetime

from pydantic import BaseModel, ConfigDict


class WorkoutResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workout_name: str
    burned_calories: int
    worked_out_at: datetime
    memo: str | None = None
