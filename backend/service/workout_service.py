from datetime import date, datetime, time

from models.workout import Workout
from repository.workout_repository import WorkoutRepository
from schemas.request.workout_request import WorkoutCreateRequest, WorkoutUpdateRequest
from schemas.response.workout_response import WorkoutResponse
from sqlalchemy.orm import Session


class WorkoutService:
    """トレーニング記録の取得・登録・更新・削除を担当するサービス。"""

    @staticmethod
    def get_workouts(db: Session, target_date: date) -> list[WorkoutResponse]:
        """指定日のトレーニング記録を一覧で取得する。"""

        workouts = WorkoutRepository.find_by_date(
            db,
            datetime.combine(target_date, time.min),
        )
        return [WorkoutResponse.model_validate(workout) for workout in workouts]

    @staticmethod
    def create_workout(
        db: Session,
        request: WorkoutCreateRequest,
    ) -> WorkoutResponse:
        """トレーニング記録を新規登録する。"""

        workout = Workout(**WorkoutService._build_workout_data(request))
        saved_workout = WorkoutRepository.create(db, workout)
        return WorkoutResponse.model_validate(saved_workout)

    @staticmethod
    def update_workout(
        db: Session,
        workout_id: int,
        request: WorkoutUpdateRequest,
    ) -> WorkoutResponse | None:
        """トレーニング記録を更新する。"""

        existing_workout = WorkoutRepository.find_by_id(db, workout_id)
        if existing_workout is None:
            return None

        updated_workout = WorkoutRepository.update(
            db,
            existing_workout,
            WorkoutService._build_workout_data(request),
        )
        return WorkoutResponse.model_validate(updated_workout)

    @staticmethod
    def delete_workout(db: Session, workout_id: int) -> bool:
        """トレーニング記録を削除する。"""

        existing_workout = WorkoutRepository.find_by_id(db, workout_id)
        if existing_workout is None:
            return False

        WorkoutRepository.delete(db, existing_workout)
        return True

    @staticmethod
    def _build_workout_data(
        request: WorkoutCreateRequest | WorkoutUpdateRequest,
    ) -> dict:
        """リクエストから保存用のトレーニングデータを組み立てる。"""

        return {
            "workout_name": request.workout_name,
            "burned_calories": request.burned_calories,
            "worked_out_at": request.worked_out_at,
            "memo": request.memo,
        }
