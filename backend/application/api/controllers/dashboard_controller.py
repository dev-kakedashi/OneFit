from datetime import date

from schemas.response.dashboard_response import DashboardDailySummaryResponse
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
