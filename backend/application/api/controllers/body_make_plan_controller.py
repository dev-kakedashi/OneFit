from common.errors.errors import BodyMakeErrors
from common.errors.exceptions import NotFoundException
from schemas.request.body_make_plan_request import BodyMakePlanUpsertRequest
from schemas.response.body_make_plan_response import BodyMakePlanResponse
from service.body_make_plan_service import BodyMakePlanService
from sqlalchemy.orm import Session


class BodyMakePlanController:
    """ボディメイク計画APIのリクエストをサービスへ橋渡しするコントローラー。"""

    @staticmethod
    def get_latest_plan(db: Session) -> BodyMakePlanResponse | None:
        """最新のボディメイク計画を取得する。"""
        return BodyMakePlanService.get_latest_plan(db)

    @staticmethod
    def list_plans(db: Session) -> list[BodyMakePlanResponse]:
        """ボディメイク計画一覧を取得する。"""
        return BodyMakePlanService.list_plans(db)

    @staticmethod
    def upsert_plan(
        db: Session,
        request: BodyMakePlanUpsertRequest,
    ) -> BodyMakePlanResponse:
        """ボディメイク計画を新規作成または同日付で更新する。"""
        return BodyMakePlanService.upsert_plan(db, request)

    @staticmethod
    def delete_plan(db: Session, body_make_plan_id: int) -> None:
        """ボディメイク計画を削除する。"""
        deleted = BodyMakePlanService.delete_plan(db, body_make_plan_id)
        if not deleted:
            raise NotFoundException(BodyMakeErrors.NOT_FOUND_FOR_DELETE)
