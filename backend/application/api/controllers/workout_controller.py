from datetime import date

from common.errors.errors import WorkoutErrors
from common.errors.exceptions import NotFoundException
from schemas.request.workout_request import WorkoutCreateRequest, WorkoutUpdateRequest
from schemas.response.workout_response import WorkoutResponse
from service.workout_service import WorkoutService
from sqlalchemy.orm import Session


class WorkoutController:
    @staticmethod
    def get_workout_logs(db: Session, target_date: date) -> list[WorkoutResponse]:
        return WorkoutService.get_workouts(db, target_date)

    @staticmethod
    def create_workout_log(
        db: Session,
        request: WorkoutCreateRequest,
    ) -> WorkoutResponse:
        return WorkoutService.create_workout(db, request)

    @staticmethod
    def update_workout_log(
        db: Session,
        workout_id: int,
        request: WorkoutUpdateRequest,
    ) -> WorkoutResponse:
        workout = WorkoutService.update_workout(db, workout_id, request)
        if workout is None:
            raise NotFoundException(WorkoutErrors.NOT_FOUND_FOR_UPDATE)
        return workout

    @staticmethod
    def delete_workout_log(db: Session, workout_id: int) -> None:
        deleted = WorkoutService.delete_workout(db, workout_id)
        if not deleted:
            raise NotFoundException(WorkoutErrors.NOT_FOUND_FOR_DELETE)
