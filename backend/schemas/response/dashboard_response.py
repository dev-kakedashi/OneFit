from datetime import date
from pydantic import BaseModel

class DailySummaryResponse(BaseModel):
    target_calories: int | None
    intake_calories: int
    burned_calories: int
    calorie_balance: int | None
    profile_registered: bool

class DashboardDailySummaryResponse(BaseModel):
    summary: DailySummaryResponse

class DashboardMonthlyMarkerResponse(BaseModel):
    date: date
    has_meal: bool
    has_workout: bool

class DashboardMonthlyMarkersResponse(BaseModel):
    markers: list[DashboardMonthlyMarkerResponse]
