from application.api.controllers.body_make_plan_controller import BodyMakePlanController
from db.session import get_db
from fastapi import APIRouter, Depends, Path, status
from schemas.request.body_make_plan_request import BodyMakePlanUpsertRequest
from schemas.response.body_make_plan_response import BodyMakePlanResponse
from sqlalchemy.orm import Session

router = APIRouter(tags=["body-make-plans"])


@router.get("/body-make-plans/latest", response_model=BodyMakePlanResponse | None)
def get_latest_body_make_plan(
    db: Session = Depends(get_db),
) -> BodyMakePlanResponse | None:
    """最新のボディメイク計画を取得する。"""

    return BodyMakePlanController.get_latest_plan(db)


@router.get("/body-make-plans", response_model=list[BodyMakePlanResponse])
def list_body_make_plans(
    db: Session = Depends(get_db),
) -> list[BodyMakePlanResponse]:
    """登録済みのボディメイク計画一覧を取得する。"""

    return BodyMakePlanController.list_plans(db)


@router.put("/body-make-plans", response_model=BodyMakePlanResponse)
def upsert_body_make_plan(
    request: BodyMakePlanUpsertRequest,
    db: Session = Depends(get_db),
) -> BodyMakePlanResponse:
    """ボディメイク計画を新規作成または同日付で更新する。"""

    return BodyMakePlanController.upsert_plan(db, request)


@router.delete(
    "/body-make-plans/{body_make_plan_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_body_make_plan(
    body_make_plan_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
) -> None:
    """ボディメイク計画を削除する。"""

    BodyMakePlanController.delete_plan(db, body_make_plan_id)
