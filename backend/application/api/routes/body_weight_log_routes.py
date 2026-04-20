from datetime import date

from application.api.controllers.body_weight_log_controller import (
    BodyWeightLogController,
)
from db.session import get_db
from fastapi import APIRouter, Depends, Path, Query, status
from schemas.request.body_weight_log_request import BodyWeightLogUpsertRequest
from schemas.response.body_weight_log_response import BodyWeightLogResponse
from sqlalchemy.orm import Session

router = APIRouter(tags=["body-weight-logs"])


@router.get("/body-weight-logs", response_model=list[BodyWeightLogResponse])
def list_body_weight_logs(
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    db: Session = Depends(get_db),
) -> list[BodyWeightLogResponse]:
    """体重記録一覧を取得する。"""

    return BodyWeightLogController.list_logs(db, date_from, date_to)


@router.get(
    "/body-weight-logs/latest",
    response_model=BodyWeightLogResponse | None,
)
def get_latest_body_weight_log(
    target_date: date = Query(..., alias="date"),
    db: Session = Depends(get_db),
) -> BodyWeightLogResponse | None:
    """指定日以前の最新体重記録を取得する。"""

    return BodyWeightLogController.get_latest_log(db, target_date)


@router.put("/body-weight-logs", response_model=BodyWeightLogResponse)
def upsert_body_weight_log(
    request: BodyWeightLogUpsertRequest,
    db: Session = Depends(get_db),
) -> BodyWeightLogResponse:
    """体重記録を新規作成または同日付で更新する。"""

    return BodyWeightLogController.upsert_log(db, request)


@router.delete(
    "/body-weight-logs/{body_weight_log_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_body_weight_log(
    body_weight_log_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
) -> None:
    """体重記録を削除する。"""

    BodyWeightLogController.delete_log(db, body_weight_log_id)
