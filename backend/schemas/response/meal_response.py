from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MealResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    meal_name: str
    calories: int
    eaten_at: datetime
    memo: str | None = None
