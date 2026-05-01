from datetime import date

from schemas.response.dashboard_response import (
    DashboardDailySummaryResponse,
    DashboardPeriodSummaryResponse,
    DashboardMonthlyMarkersResponse,
)
from service.dashboard_service import DashboardService
from sqlalchemy.orm import Session


class DashboardController:
    """ダッシュボードAPIのリクエストをサービスへ橋渡しするコントローラー。"""

    @staticmethod
    def get_daily_summary(
        db: Session,
        target_date: date,
    ) -> DashboardDailySummaryResponse:
        """指定日のダッシュボード集計結果を取得する。"""

        return DashboardService.get_daily_summary(db, target_date)

    @staticmethod
    def get_period_summary(
        db: Session,
        target_date: date,
    ) -> DashboardPeriodSummaryResponse:
        """指定日を含む週次集計結果を取得する。"""

        return DashboardService.get_period_summary(db, target_date)

    @staticmethod
    def get_monthly_markers(
        db: Session,
        target_month: date,
    ) -> DashboardMonthlyMarkersResponse:
        """指定月の記録マーカー一覧を取得する。"""

        return DashboardService.get_monthly_markers(db, target_month)
