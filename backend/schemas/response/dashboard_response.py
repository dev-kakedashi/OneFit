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
    start_weight_kg: float | None
    memo: str | None
    body_make_plan_registered: bool
    profile_registered: bool


class DashboardDailySummaryResponse(BaseModel):
    summary: DailySummaryResponse


class PeriodSummaryResponse(BaseModel):
    window_start_date: date
    window_end_date: date
    window_days: int
    calorie_target_total: int | None
    intake_calories: int
    burned_calories: int
    water_target_total_ml: int | None
    water_intake_ml: int
    meal_log_count: int
    meal_day_count: int
    workout_log_count: int
    workout_day_count: int
    water_log_count: int
    water_day_count: int
    body_weight_log_count: int
    body_weight_day_count: int
    recorded_day_count: int
    body_weight_start_kg: float | None
    body_weight_end_kg: float | None
    body_weight_change_kg: float | None
    profile_registered: bool


class DashboardPeriodSummaryResponse(BaseModel):
    summary: PeriodSummaryResponse


class DashboardMonthlyMarkerResponse(BaseModel):
    date: date
    has_meal: bool
    has_workout: bool


class DashboardMonthlyMarkersResponse(BaseModel):
    markers: list[DashboardMonthlyMarkerResponse]
