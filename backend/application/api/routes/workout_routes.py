from datetime import date

from application.api.controllers.workout_controller import WorkoutController
from db.session import get_db
from fastapi import APIRouter, Depends, Path, Query, status
from schemas.request.workout_request import WorkoutCreateRequest, WorkoutUpdateRequest
from schemas.response.workout_response import WorkoutResponse
from sqlalchemy.orm import Session

router = APIRouter(tags=["workout-logs"])


@router.get("/workout-logs", response_model=list[WorkoutResponse])
def get_workout_logs(
    target_date: date = Query(..., alias="date"),
    db: Session = Depends(get_db),
) -> list[WorkoutResponse]:
    """指定日のトレーニング記録一覧を取得する。"""

    return WorkoutController.get_workout_logs(db, target_date)


@router.post(
    "/workout-logs",
    response_model=WorkoutResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_workout_log(
    request: WorkoutCreateRequest,
    db: Session = Depends(get_db),
) -> WorkoutResponse:
    """トレーニング記録を登録する。"""

    return WorkoutController.create_workout_log(db, request)


@router.put("/workout-logs/{workout_id}", response_model=WorkoutResponse)
def update_workout_log(
    workout_id: int = Path(..., gt=0),
    request: WorkoutUpdateRequest = ...,
    db: Session = Depends(get_db),
) -> WorkoutResponse:
    return WorkoutController.update_workout_log(db, workout_id, request)


@router.delete("/workout-logs/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout_log(
    workout_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
) -> None:
    WorkoutController.delete_workout_log(db, workout_id)
