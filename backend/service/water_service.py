from datetime import date, datetime, time

from common.errors.errors import WaterErrors
from common.errors.exceptions import AppException, RepositoryException, ServiceException
from models.water_log import WaterLog
from repository.water_repository import WaterRepository
from schemas.request.water_request import WaterLogCreateRequest, WaterLogUpdateRequest
from schemas.response.water_response import WaterLogResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session


class WaterService:
    """水分記録の取得・登録・更新・削除を担当するサービス。"""

    @staticmethod
    def get_water_logs(db: Session, target_date: date) -> list[WaterLogResponse]:
        """指定日の水分記録一覧を取得する。

        Args:
            db: DBセッション。
            target_date: 取得対象日。

        Returns:
            指定日の水分記録一覧。

        Raises:
            RepositoryException: DB取得処理で障害が発生した場合。
            ServiceException: 想定外のサービス層エラーが発生した場合。
        """
        try:
            water_logs = WaterRepository.find_by_date(
                db,
                datetime.combine(target_date, time.min),
            )
            return [WaterLogResponse.model_validate(water_log) for water_log in water_logs]
        except AppException:
            raise
        except SQLAlchemyError as error:
            raise RepositoryException(
                WaterErrors.DB_FETCH_ERROR, error=error
            ) from error
        except Exception as error:
            raise ServiceException(WaterErrors.FETCH_FAILED, error=error) from error

    @staticmethod
    def create_water_log(
        db: Session,
        request: WaterLogCreateRequest,
    ) -> WaterLogResponse:
        """水分記録を新規登録する。

        Args:
            db: DBセッション。
            request: 水分記録入力値。

        Returns:
            保存後の水分記録。

        Raises:
            RepositoryException: DB保存処理で障害が発生した場合。
            ServiceException: 想定外のサービス層エラーが発生した場合。
        """
        try:
            water_log = WaterLog(**WaterService._build_water_log_data(request))
            saved_water_log = WaterRepository.create(db, water_log)
            return WaterLogResponse.model_validate(saved_water_log)
        except AppException:
            raise
        except SQLAlchemyError as error:
            raise RepositoryException(
                WaterErrors.DB_SAVE_ERROR, error=error
            ) from error
        except Exception as error:
            raise ServiceException(WaterErrors.SAVE_FAILED, error=error) from error

    @staticmethod
    def update_water_log(
        db: Session,
        water_log_id: int,
        request: WaterLogUpdateRequest,
    ) -> WaterLogResponse | None:
        """水分記録を更新する。

        Args:
            db: DBセッション。
            water_log_id: 更新対象ID。
            request: 更新内容。

        Returns:
            更新後の水分記録。対象が存在しない場合は ``None`` を返す。

        Raises:
            RepositoryException: DB更新処理で障害が発生した場合。
            ServiceException: 想定外のサービス層エラーが発生した場合。
        """
        try:
            existing_water_log = WaterRepository.find_by_id(db, water_log_id)
            if existing_water_log is None:
                return None

            updated_water_log = WaterRepository.update(
                db,
                existing_water_log,
                WaterService._build_water_log_data(request),
            )
            return WaterLogResponse.model_validate(updated_water_log)
        except AppException:
            raise
        except SQLAlchemyError as error:
            raise RepositoryException(
                WaterErrors.DB_UPDATE_ERROR, error=error
            ) from error
        except Exception as error:
            raise ServiceException(WaterErrors.UPDATE_FAILED, error=error) from error

    @staticmethod
    def delete_water_log(db: Session, water_log_id: int) -> bool:
        """水分記録を削除する。

        Args:
            db: DBセッション。
            water_log_id: 削除対象ID。

        Returns:
            削除に成功した場合は ``True``、対象が存在しない場合は ``False``。

        Raises:
            RepositoryException: DB削除処理で障害が発生した場合。
            ServiceException: 想定外のサービス層エラーが発生した場合。
        """
        try:
            existing_water_log = WaterRepository.find_by_id(db, water_log_id)
            if existing_water_log is None:
                return False

            WaterRepository.delete(db, existing_water_log)
            return True
        except AppException:
            raise
        except SQLAlchemyError as error:
            raise RepositoryException(
                WaterErrors.DB_DELETE_ERROR, error=error
            ) from error
        except Exception as error:
            raise ServiceException(WaterErrors.DELETE_FAILED, error=error) from error

    @staticmethod
    def _build_water_log_data(
        request: WaterLogCreateRequest | WaterLogUpdateRequest,
    ) -> dict:
        """保存用の水分記録データを組み立てる。

        Args:
            request: 水分記録入力値。

        Returns:
            DB保存用の辞書データ。
        """
        return {
            "amount_ml": request.amount_ml,
            "drank_at": request.drank_at,
            "memo": request.memo,
        }
