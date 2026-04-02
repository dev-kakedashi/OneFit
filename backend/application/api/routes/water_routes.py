from datetime import date

from application.api.controllers.water_controller import WaterController
from db.session import get_db
from fastapi import APIRouter, Depends, Path, Query, status
from schemas.request.water_request import WaterLogCreateRequest, WaterLogUpdateRequest
from schemas.response.water_response import WaterLogResponse
from sqlalchemy.orm import Session

router = APIRouter(tags=["water-logs"])


@router.get("/water-logs", response_model=list[WaterLogResponse])
def get_water_logs(
    target_date: date = Query(..., alias="date"),
    db: Session = Depends(get_db),
) -> list[WaterLogResponse]:
    """指定日の水分記録一覧を取得する。"""

    return WaterController.get_water_logs(db, target_date)


@router.post(
    "/water-logs",
    response_model=WaterLogResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_water_log(
    request: WaterLogCreateRequest,
    db: Session = Depends(get_db),
) -> WaterLogResponse:
    """水分記録を登録する。"""

    return WaterController.create_water_log(db, request)


@router.put("/water-logs/{water_log_id}", response_model=WaterLogResponse)
def update_water_log(
    water_log_id: int = Path(..., gt=0),
    request: WaterLogUpdateRequest = ...,
    db: Session = Depends(get_db),
) -> WaterLogResponse:
    return WaterController.update_water_log(db, water_log_id, request)


@router.delete("/water-logs/{water_log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_water_log(
    water_log_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
) -> None:
    WaterController.delete_water_log(db, water_log_id)
