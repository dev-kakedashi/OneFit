from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class MealCreateRequest(BaseModel):
    meal_name: str
    calories: int = Field(..., ge=0)
    eaten_at: datetime
    memo: str | None = None

    @field_validator("meal_name")
    @classmethod
    def validate_meal_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("meal_name must not be blank")
        return value


class MealUpdateRequest(BaseModel):
    meal_name: str
    calories: int = Field(..., ge=0)
    eaten_at: datetime
    memo: str | None = None

    @field_validator("meal_name")
    @classmethod
    def validate_meal_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("meal_name must not be blank")
        return value
