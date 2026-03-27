from datetime import date

from application.api.controllers.dashboard_controller import DashboardController
from db.session import get_db
from fastapi import APIRouter, Depends, Query
from schemas.response.dashboard_response import DashboardDailySummaryResponse
from sqlalchemy.orm import Session

router = APIRouter(tags=["dashboard"])


@router.get(
    "/dashboard/daily-summary",
    response_model=DashboardDailySummaryResponse,
)
def get_daily_summary(
    target_date: date = Query(..., alias="date"),
    db: Session = Depends(get_db),
) -> DashboardDailySummaryResponse:
    """指定日のダッシュボード集計結果を取得する。"""

    return DashboardController.get_daily_summary(db, target_date)
