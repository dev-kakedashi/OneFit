from datetime import date, datetime, time

from models.meal import Meal
from repository.meal_repository import MealRepository
from schemas.request.meal_request import MealCreateRequest, MealUpdateRequest
from schemas.response.meal_response import MealResponse
from sqlalchemy.orm import Session


class MealService:
    """食事記録の取得・登録・更新・削除を担当するサービス。"""

    @staticmethod
    def get_meals(db: Session, target_date: date) -> list[MealResponse]:
        """指定日の食事記録を一覧で取得する。"""

        meals = MealRepository.find_by_date(
            db,
            datetime.combine(target_date, time.min),
        )
        return [MealResponse.model_validate(meal) for meal in meals]

    @staticmethod
    def create_meal(db: Session, request: MealCreateRequest) -> MealResponse:
        """食事記録を新規登録する。"""

        meal = Meal(**MealService._build_meal_data(request))
        saved_meal = MealRepository.create(db, meal)
        return MealResponse.model_validate(saved_meal)

    @staticmethod
    def update_meal(
        db: Session,
        meal_id: int,
        request: MealUpdateRequest,
    ) -> MealResponse | None:
        """食事記録を更新する。"""

        existing_meal = MealRepository.find_by_id(db, meal_id)
        if existing_meal is None:
            return None

        updated_meal = MealRepository.update(
            db,
            existing_meal,
            MealService._build_meal_data(request),
        )
        return MealResponse.model_validate(updated_meal)

    @staticmethod
    def delete_meal(db: Session, meal_id: int) -> bool:
        """食事記録を削除する。"""

        existing_meal = MealRepository.find_by_id(db, meal_id)
        if existing_meal is None:
            return False

        MealRepository.delete(db, existing_meal)
        return True

    @staticmethod
    def _build_meal_data(request: MealCreateRequest | MealUpdateRequest) -> dict:
        """リクエストから保存用の食事データを組み立てる。"""

        return {
            "meal_name": request.meal_name,
            "calories": request.calories,
            "eaten_at": request.eaten_at,
            "memo": request.memo,
        }
