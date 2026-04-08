from datetime import date

from enums.goal_course import GoalCourse
from pydantic import BaseModel


class DailySummaryResponse(BaseModel):
    target_calories: int | None
    maintenance_calories: int | None
    daily_calorie_adjustment: int | None
    intake_calories: int
    burned_calories: int
    calorie_balance: int | None
    target_water_intake_ml: int | None
    water_intake_ml: int
    remaining_water_intake_ml: int | None
    course: GoalCourse | None
    target_end_date: date | None
    target_weight_kg: float | None
    memo: str | None
    body_make_plan_registered: bool
    profile_registered: bool


class DashboardDailySummaryResponse(BaseModel):
    summary: DailySummaryResponse


class DashboardMonthlyMarkerResponse(BaseModel):
    date: date
    has_meal: bool
    has_workout: bool


class DashboardMonthlyMarkersResponse(BaseModel):
    markers: list[DashboardMonthlyMarkerResponse]
