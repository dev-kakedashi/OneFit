from datetime import date, datetime, time

from common.errors.errors import MealErrors
from common.errors.exceptions import AppException, RepositoryException, ServiceException
from models.meal import Meal
from repository.meal_repository import MealRepository
from schemas.request.meal_request import MealCreateRequest, MealUpdateRequest
from schemas.response.meal_response import MealResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session


class MealService:
    """食事記録の取得・登録・更新・削除を担当するサービス。"""

    @staticmethod
    def get_meals(db: Session, target_date: date) -> list[MealResponse]:
        """指定日の食事記録一覧を取得する。

        Args:
            db: DBセッション。
            target_date: 取得対象日。

        Returns:
            指定日の食事記録一覧。

        Raises:
            RepositoryException: DB取得処理で障害が発生した場合。
            ServiceException: 想定外のサービス層エラーが発生した場合。
        """
        try:
            meals = MealRepository.find_by_date(
                db,
                datetime.combine(target_date, time.min),
            )
            return [MealResponse.model_validate(meal) for meal in meals]
        except AppException:
            raise
        except SQLAlchemyError as error:
            raise RepositoryException(MealErrors.DB_FETCH_ERROR, error=error) from error
        except Exception as error:
            raise ServiceException(MealErrors.FETCH_FAILED, error=error) from error

    @staticmethod
    def create_meal(db: Session, request: MealCreateRequest) -> MealResponse:
        """食事記録を新規登録する。

        Args:
            db: DBセッション。
            request: 食事記録入力値。

        Returns:
            保存後の食事記録。

        Raises:
            RepositoryException: DB保存処理で障害が発生した場合。
            ServiceException: 想定外のサービス層エラーが発生した場合。
        """
        try:
            meal = Meal(**MealService._build_meal_data(request))
            saved_meal = MealRepository.create(db, meal)
            return MealResponse.model_validate(saved_meal)
        except AppException:
            raise
        except SQLAlchemyError as error:
            raise RepositoryException(MealErrors.DB_SAVE_ERROR, error=error) from error
        except Exception as error:
            raise ServiceException(MealErrors.SAVE_FAILED, error=error) from error

    @staticmethod
    def update_meal(
        db: Session,
        meal_id: int,
        request: MealUpdateRequest,
    ) -> MealResponse | None:
        """食事記録を更新する。

        Args:
            db: DBセッション。
            meal_id: 更新対象ID。
            request: 更新内容。

        Returns:
            更新後の食事記録。対象が存在しない場合は ``None`` を返す。

        Raises:
            RepositoryException: DB更新処理で障害が発生した場合。
            ServiceException: 想定外のサービス層エラーが発生した場合。
        """
        try:
            existing_meal = MealRepository.find_by_id(db, meal_id)
            if existing_meal is None:
                return None

            updated_meal = MealRepository.update(
                db,
                existing_meal,
                MealService._build_meal_data(request),
            )
            return MealResponse.model_validate(updated_meal)
        except AppException:
            raise
        except SQLAlchemyError as error:
            raise RepositoryException(
                MealErrors.DB_UPDATE_ERROR, error=error
            ) from error
        except Exception as error:
            raise ServiceException(MealErrors.UPDATE_FAILED, error=error) from error

    @staticmethod
    def delete_meal(db: Session, meal_id: int) -> bool:
        """食事記録を削除する。

        Args:
            db: DBセッション。
            meal_id: 削除対象ID。

        Returns:
            削除に成功した場合は ``True``、対象が存在しない場合は ``False``。

        Raises:
            RepositoryException: DB削除処理で障害が発生した場合。
            ServiceException: 想定外のサービス層エラーが発生した場合。
        """
        try:
            existing_meal = MealRepository.find_by_id(db, meal_id)
            if existing_meal is None:
                return False

            MealRepository.delete(db, existing_meal)
            return True
        except AppException:
            raise
        except SQLAlchemyError as error:
            raise RepositoryException(
                MealErrors.DB_DELETE_ERROR, error=error
            ) from error
        except Exception as error:
            raise ServiceException(MealErrors.DELETE_FAILED, error=error) from error

    @staticmethod
    def _build_meal_data(request: MealCreateRequest | MealUpdateRequest) -> dict:
        """保存用の食事データを組み立てる。

        Args:
            request: 食事記録入力値。

        Returns:
            DB保存用の辞書データ。
        """
        return {
            "meal_name": request.meal_name,
            "calories": request.calories,
            "eaten_at": request.eaten_at,
            "memo": request.memo,
        }
