from datetime import datetime

from pydantic import BaseModel


class MealCreateRequest(BaseModel):
    meal_name: str
    calories: int
    eaten_at: datetime
    memo: str | None = None


class MealUpdateRequest(BaseModel):
    meal_name: str
    calories: int
    eaten_at: datetime
    memo: str | None = None
