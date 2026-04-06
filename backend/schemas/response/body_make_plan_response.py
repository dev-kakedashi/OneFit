from datetime import date

from enums.goal_course import GoalCourse
from pydantic import BaseModel, ConfigDict


class BodyMakePlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    course: GoalCourse
    effective_from: date
    duration_days: int
    target_end_date: date
    target_weight_kg: float
    memo: str | None = None
    start_weight_kg: float
    maintenance_calories: int
    daily_calorie_adjustment: int
    target_calories: int
