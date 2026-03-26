from datetime import date

from application.api.controllers.meal_controller import MealController
from db.session import get_db
from fastapi import APIRouter, Depends, Query, status
from schemas.request.meal_request import MealCreateRequest, MealUpdateRequest
from schemas.response.meal_response import MealResponse
from sqlalchemy.orm import Session

router = APIRouter(tags=["meal-logs"])


@router.get("/meal-logs", response_model=list[MealResponse])
def get_meal_logs(
    target_date: date = Query(..., alias="date"),
    db: Session = Depends(get_db),
) -> list[MealResponse]:
    """指定日の食事記録一覧を取得する。"""

    return MealController.get_meal_logs(db, target_date)


@router.post(
    "/meal-logs",
    response_model=MealResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_meal_log(
    request: MealCreateRequest,
    db: Session = Depends(get_db),
) -> MealResponse:
    """食事記録を登録する。"""

    return MealController.create_meal_log(db, request)


@router.put("/meal-logs/{meal_id}", response_model=MealResponse)
def update_meal_log(
    meal_id: int,
    request: MealUpdateRequest,
    db: Session = Depends(get_db),
) -> MealResponse:
    """食事記録を更新する。"""

    return MealController.update_meal_log(db, meal_id, request)


@router.delete("/meal-logs/{meal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meal_log(
    meal_id: int,
    db: Session = Depends(get_db),
) -> None:
    """食事記録を削除する。"""

    MealController.delete_meal_log(db, meal_id)
