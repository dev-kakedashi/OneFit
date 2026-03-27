from datetime import date

from common.errors.errors import MealErrors
from common.errors.exceptions import NotFoundException
from schemas.request.meal_request import MealCreateRequest, MealUpdateRequest
from schemas.response.meal_response import MealResponse
from service.meal_service import MealService
from sqlalchemy.orm import Session


class MealController:
    @staticmethod
    def get_meal_logs(db: Session, target_date: date) -> list[MealResponse]:
        return MealService.get_meals(db, target_date)

    @staticmethod
    def create_meal_log(db: Session, request: MealCreateRequest) -> MealResponse:
        return MealService.create_meal(db, request)

    @staticmethod
    def update_meal_log(
        db: Session,
        meal_id: int,
        request: MealUpdateRequest,
    ) -> MealResponse:
        meal = MealService.update_meal(db, meal_id, request)
        if meal is None:
            raise NotFoundException(MealErrors.NOT_FOUND_FOR_UPDATE)
        return meal

    @staticmethod
    def delete_meal_log(db: Session, meal_id: int) -> None:
        deleted = MealService.delete_meal(db, meal_id)
        if not deleted:
            raise NotFoundException(MealErrors.NOT_FOUND_FOR_DELETE)
