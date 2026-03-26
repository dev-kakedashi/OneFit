from datetime import date

from fastapi import HTTPException, status
from schemas.request.meal_request import MealCreateRequest, MealUpdateRequest
from schemas.response.meal_response import MealResponse
from service.meal_service import MealService
from sqlalchemy.orm import Session


class MealController:
    """食事記録APIのリクエストをサービスへ橋渡しするコントローラー。"""

    @staticmethod
    def get_meal_logs(db: Session, target_date: date) -> list[MealResponse]:
        """指定日の食事記録一覧を取得する。"""

        return MealService.get_meals(db, target_date)

    @staticmethod
    def create_meal_log(db: Session, request: MealCreateRequest) -> MealResponse:
        """食事記録を登録する。"""

        return MealService.create_meal(db, request)

    @staticmethod
    def update_meal_log(
        db: Session,
        meal_id: int,
        request: MealUpdateRequest,
    ) -> MealResponse:
        """食事記録を更新する。"""

        meal = MealService.update_meal(db, meal_id, request)
        if meal is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meal not found",
            )

        return meal

    @staticmethod
    def delete_meal_log(db: Session, meal_id: int) -> None:
        """食事記録を削除する。"""

        deleted = MealService.delete_meal(db, meal_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meal not found",
            )
