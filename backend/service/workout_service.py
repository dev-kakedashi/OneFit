from datetime import date, datetime, time

from common.errors.errors import WorkoutErrors
from common.errors.exceptions import AppException, RepositoryException, ServiceException
from models.workout import Workout
from repository.workout_repository import WorkoutRepository
from schemas.request.workout_request import WorkoutCreateRequest, WorkoutUpdateRequest
from schemas.response.workout_response import WorkoutResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session


class WorkoutService:
    """トレーニング記録の取得・登録・更新・削除を担当するサービス。"""

    @staticmethod
    def get_workouts(db: Session, target_date: date) -> list[WorkoutResponse]:
        """指定日のトレーニング記録一覧を取得する。

        Args:
            db: DBセッション。
            target_date: 取得対象日。

        Returns:
            指定日のトレーニング記録一覧。

        Raises:
            RepositoryException: DB取得処理で障害が発生した場合。
            ServiceException: 想定外のサービス層エラーが発生した場合。
        """
        try:
            workouts = WorkoutRepository.find_by_date(
                db,
                datetime.combine(target_date, time.min),
            )
            return [WorkoutResponse.model_validate(workout) for workout in workouts]
        except AppException:
            raise
        except SQLAlchemyError as error:
            raise RepositoryException(
                WorkoutErrors.DB_FETCH_ERROR, error=error
            ) from error
        except Exception as error:
            raise ServiceException(WorkoutErrors.FETCH_FAILED, error=error) from error

    @staticmethod
    def create_workout(
        db: Session,
        request: WorkoutCreateRequest,
    ) -> WorkoutResponse:
        """トレーニング記録を新規登録する。

        Args:
            db: DBセッション。
            request: トレーニング記録入力値。

        Returns:
            保存後のトレーニング記録。

        Raises:
            RepositoryException: DB保存処理で障害が発生した場合。
            ServiceException: 想定外のサービス層エラーが発生した場合。
        """
        try:
            workout = Workout(**WorkoutService._build_workout_data(request))
            saved_workout = WorkoutRepository.create(db, workout)
            return WorkoutResponse.model_validate(saved_workout)
        except AppException:
            raise
        except SQLAlchemyError as error:
            raise RepositoryException(
                WorkoutErrors.DB_SAVE_ERROR, error=error
            ) from error
        except Exception as error:
            raise ServiceException(WorkoutErrors.SAVE_FAILED, error=error) from error

    @staticmethod
    def update_workout(
        db: Session,
        workout_id: int,
        request: WorkoutUpdateRequest,
    ) -> WorkoutResponse | None:
        """トレーニング記録を更新する。

        Args:
            db: DBセッション。
            workout_id: 更新対象ID。
            request: 更新内容。

        Returns:
            更新後のトレーニング記録。対象が存在しない場合は ``None`` を返す。

        Raises:
            RepositoryException: DB更新処理で障害が発生した場合。
            ServiceException: 想定外のサービス層エラーが発生した場合。
        """
        try:
            existing_workout = WorkoutRepository.find_by_id(db, workout_id)
            if existing_workout is None:
                return None

            updated_workout = WorkoutRepository.update(
                db,
                existing_workout,
                WorkoutService._build_workout_data(request),
            )
            return WorkoutResponse.model_validate(updated_workout)
        except AppException:
            raise
        except SQLAlchemyError as error:
            raise RepositoryException(
                WorkoutErrors.DB_UPDATE_ERROR, error=error
            ) from error
        except Exception as error:
            raise ServiceException(WorkoutErrors.UPDATE_FAILED, error=error) from error

    @staticmethod
    def delete_workout(db: Session, workout_id: int) -> bool:
        """トレーニング記録を削除する。

        Args:
            db: DBセッション。
            workout_id: 削除対象ID。

        Returns:
            削除に成功した場合は ``True``、対象が存在しない場合は ``False``。

        Raises:
            RepositoryException: DB削除処理で障害が発生した場合。
            ServiceException: 想定外のサービス層エラーが発生した場合。
        """
        try:
            existing_workout = WorkoutRepository.find_by_id(db, workout_id)
            if existing_workout is None:
                return False

            WorkoutRepository.delete(db, existing_workout)
            return True
        except AppException:
            raise
        except SQLAlchemyError as error:
            raise RepositoryException(
                WorkoutErrors.DB_DELETE_ERROR, error=error
            ) from error
        except Exception as error:
            raise ServiceException(WorkoutErrors.DELETE_FAILED, error=error) from error

    @staticmethod
    def _build_workout_data(
        request: WorkoutCreateRequest | WorkoutUpdateRequest,
    ) -> dict:
        """保存用のトレーニングデータを組み立てる。

        Args:
            request: トレーニング記録入力値。

        Returns:
            DB保存用の辞書データ。
        """
        return {
            "workout_name": request.workout_name,
            "burned_calories": request.burned_calories,
            "worked_out_at": request.worked_out_at,
            "memo": request.memo,
        }
