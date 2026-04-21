from datetime import date

from enums.goal_course import GoalCourse
from pydantic import BaseModel, Field


class BodyMakePlanUpsertRequest(BaseModel):
    course: GoalCourse
    effective_from: date
    target_weight_kg: float = Field(..., ge=0)
    duration_days: int = Field(..., ge=0)
    memo: str | None = None
