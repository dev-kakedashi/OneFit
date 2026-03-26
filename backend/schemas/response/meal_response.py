from datetime import datetime

from pydantic import BaseModel


class MealResponse(BaseModel):
    id: int
    meal_name: str
    calories: int
    eaten_at: datetime
    memo: str | None

    class Config:
        from_attributes = True
