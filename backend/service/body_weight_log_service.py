from datetime import date

from common.errors.errors import BodyWeightErrors
from common.errors.exceptions import (
    AppException,
    RepositoryException,
    ServiceException,
    ValidationException,
)
from models.body_weight_log import BodyWeightLog
from repository.body_weight_log_repository import BodyWeightLogRepository
from repository.user_repository import UserRepository
from schemas.request.body_weight_log_request import BodyWeightLogUpsertRequest
from schemas.response.body_weight_log_response import BodyWeightLogResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session


class BodyWeightLogService:
    """体重記録の取得・保存・削除を担当するサービス。"""

    @staticmethod
    def list_logs(
        db: Session,
        date_from: date | None = None,
        date_to: date | None = None,
    ) -> list[BodyWeightLogResponse]:
        """体重記録一覧を取得する。

        Args:
            db: DBセッション。
            date_from: 取得開始日。
            date_to: 取得終了日。

        Returns:
            体重記録一覧。プロフィール未登録の場合は空配列を返す。

        Raises:
            ValidationException: 日付範囲が不正な場合。
            RepositoryException: DB取得処理で障害が発生した場合。
            ServiceException: 想定外のサービス層エラーが発生した場合。
        """
        try:
            if date_from is not None and date_to is not None and date_from > date_to:
                raise ValidationException(BodyWeightErrors.INVALID_DATE_RANGE)

            user = UserRepository.get_first(db)
            if user is None:
                return []

            logs = BodyWeightLogRepository.find_by_date_range(
                db=db,
                user_id=user.id,
                date_from=date_from,
                date_to=date_to,
            )
            return [BodyWeightLogResponse.model_validate(log) for log in logs]
        except AppException:
            raise
        except SQLAlchemyError as error:
            raise RepositoryException(
                BodyWeightErrors.DB_FETCH_ERROR, error=error
            ) from error
        except Exception as error:
            raise ServiceException(BodyWeightErrors.FETCH_FAILED, error=error) from error

    @staticmethod
    def get_latest_log(
        db: Session,
        target_date: date,
    ) -> BodyWeightLogResponse | None:
        """指定日以前の最新体重記録を取得する。

        Args:
            db: DBセッション。
            target_date: 基準日。

        Returns:
            指定日以前の最新体重記録。未登録の場合は ``None`` を返す。

        Raises:
            RepositoryException: DB取得処理で障害が発生した場合。
            ServiceException: 想定外のサービス層エラーが発生した場合。
        """
        try:
            user = UserRepository.get_first(db)
            if user is None:
                return None

            log = BodyWeightLogRepository.find_latest_on_or_before(
                db=db,
                user_id=user.id,
                target_date=target_date,
            )
            if log is None:
                return None

            return BodyWeightLogResponse.model_validate(log)
        except AppException:
            raise
        except SQLAlchemyError as error:
            raise RepositoryException(
                BodyWeightErrors.DB_FETCH_ERROR, error=error
            ) from error
        except Exception as error:
            raise ServiceException(BodyWeightErrors.FETCH_FAILED, error=error) from error

    @staticmethod
    def upsert_log(
        db: Session,
        request: BodyWeightLogUpsertRequest,
    ) -> BodyWeightLogResponse:
        """体重記録を新規作成または同日付で更新する。

        Args:
            db: DBセッション。
            request: 保存対象の体重記録入力値。

        Returns:
            保存後の体重記録。

        Raises:
            ValidationException: プロフィールが未登録の場合。
            RepositoryException: DB保存処理で障害が発生した場合。
            ServiceException: 想定外のサービス層エラーが発生した場合。
        """
        try:
            user = UserRepository.get_first(db)
            if user is None:
                raise ValidationException(BodyWeightErrors.PROFILE_REQUIRED)

            log_data = BodyWeightLogService._build_log_data(
                request=request,
                user_id=user.id,
            )
            existing_log = BodyWeightLogRepository.find_by_user_and_measured_on(
                db=db,
                user_id=user.id,
                measured_on=request.measured_on,
            )

            if existing_log is None:
                saved_log = BodyWeightLogRepository.create(
                    db,
                    BodyWeightLog(**log_data),
                )
            else:
                saved_log = BodyWeightLogRepository.update(
                    db,
                    existing_log,
                    log_data,
                )

            return BodyWeightLogResponse.model_validate(saved_log)
        except AppException:
            raise
        except SQLAlchemyError as error:
            raise RepositoryException(
                BodyWeightErrors.DB_SAVE_ERROR, error=error
            ) from error
        except Exception as error:
            raise ServiceException(BodyWeightErrors.SAVE_FAILED, error=error) from error

    @staticmethod
    def delete_log(db: Session, body_weight_log_id: int) -> bool:
        """体重記録を削除する。

        Args:
            db: DBセッション。
            body_weight_log_id: 削除対象ID。

        Returns:
            削除に成功した場合は ``True``、対象が存在しない場合は ``False``。

        Raises:
            RepositoryException: DB削除処理で障害が発生した場合。
            ServiceException: 想定外のサービス層エラーが発生した場合。
        """
        try:
            existing_log = BodyWeightLogRepository.find_by_id(db, body_weight_log_id)
            if existing_log is None:
                return False

            BodyWeightLogRepository.delete(db, existing_log)
            return True
        except AppException:
            raise
        except SQLAlchemyError as error:
            raise RepositoryException(
                BodyWeightErrors.DB_DELETE_ERROR, error=error
            ) from error
        except Exception as error:
            raise ServiceException(BodyWeightErrors.DELETE_FAILED, error=error) from error

    @staticmethod
    def _build_log_data(
        request: BodyWeightLogUpsertRequest,
        user_id: int,
    ) -> dict:
        """保存用の体重記録データを組み立てる。

        Args:
            request: 体重記録入力値。
            user_id: 紐づくユーザーID。

        Returns:
            DB保存用の辞書データ。
        """
        return {
            "user_id": user_id,
            "measured_on": request.measured_on,
            "weight_kg": request.weight_kg,
            "memo": request.memo,
        }
