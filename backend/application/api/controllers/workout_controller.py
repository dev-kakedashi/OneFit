from datetime import date

from fastapi import HTTPException, status
from schemas.request.workout_request import WorkoutCreateRequest, WorkoutUpdateRequest
from schemas.response.workout_response import WorkoutResponse
from service.workout_service import WorkoutService
from sqlalchemy.orm import Session


class WorkoutController:
    """トレーニング記録APIのリクエストをサービスへ橋渡しするコントローラー。"""

    @staticmethod
    def get_workout_logs(db: Session, target_date: date) -> list[WorkoutResponse]:
        """指定日のトレーニング記録一覧を取得する。"""

        return WorkoutService.get_workouts(db, target_date)

    @staticmethod
    def create_workout_log(
        db: Session,
        request: WorkoutCreateRequest,
    ) -> WorkoutResponse:
        """トレーニング記録を登録する。"""

        return WorkoutService.create_workout(db, request)

    @staticmethod
    def update_workout_log(
        db: Session,
        workout_id: int,
        request: WorkoutUpdateRequest,
    ) -> WorkoutResponse:
        """トレーニング記録を更新する。"""

        workout = WorkoutService.update_workout(db, workout_id, request)
        if workout is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout not found",
            )

        return workout

    @staticmethod
    def delete_workout_log(db: Session, workout_id: int) -> None:
        """トレーニング記録を削除する。"""

        deleted = WorkoutService.delete_workout(db, workout_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout not found",
            )
