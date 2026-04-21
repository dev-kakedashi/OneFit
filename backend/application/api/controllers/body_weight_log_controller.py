from datetime import date

from common.errors.errors import BodyWeightErrors
from common.errors.exceptions import NotFoundException
from schemas.request.body_weight_log_request import BodyWeightLogUpsertRequest
from schemas.response.body_weight_log_response import BodyWeightLogResponse
from service.body_weight_log_service import BodyWeightLogService
from sqlalchemy.orm import Session


class BodyWeightLogController:
    """体重記録APIのリクエストをサービスへ橋渡しするコントローラー。"""

    @staticmethod
    def list_logs(
        db: Session,
        date_from: date | None = None,
        date_to: date | None = None,
    ) -> list[BodyWeightLogResponse]:
        """体重記録一覧を取得する。"""
        return BodyWeightLogService.list_logs(db, date_from, date_to)

    @staticmethod
    def get_latest_log(
        db: Session,
        target_date: date,
    ) -> BodyWeightLogResponse | None:
        """指定日以前の最新体重記録を取得する。"""
        return BodyWeightLogService.get_latest_log(db, target_date)

    @staticmethod
    def upsert_log(
        db: Session,
        request: BodyWeightLogUpsertRequest,
    ) -> BodyWeightLogResponse:
        """体重記録を新規作成または同日付で更新する。"""
        return BodyWeightLogService.upsert_log(db, request)

    @staticmethod
    def delete_log(db: Session, body_weight_log_id: int) -> None:
        """体重記録を削除する。"""
        deleted = BodyWeightLogService.delete_log(db, body_weight_log_id)
        if not deleted:
            raise NotFoundException(BodyWeightErrors.NOT_FOUND_FOR_DELETE)
