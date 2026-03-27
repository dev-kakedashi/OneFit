from common.errors.errors import ProfileErrors
from common.errors.exceptions import AppException, RepositoryException, ServiceException
from domain.user.calculators import (
    calculate_basal_metabolism,
    calculate_required_calories,
)
from models.user import User
from repository.user_repository import UserRepository
from schemas.request.user_request import UserUpsertRequest
from schemas.response.user_response import UserResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session


class UserService:
    """プロフィール情報の取得と保存を担当するサービス。"""

    @staticmethod
    def get_user(db: Session) -> UserResponse | None:
        """登録済みのプロフィールを取得する。

        Args:
            db: DBセッション。

        Returns:
            登録済みプロフィール。未登録の場合は ``None`` を返す。

        Raises:
            RepositoryException: DB取得処理で障害が発生した場合。
            ServiceException: 想定外のサービス層エラーが発生した場合。
        """
        try:
            user = UserRepository.get_first(db)
            if user is None:
                return None

            return UserResponse.model_validate(user)
        except AppException:
            raise
        except SQLAlchemyError as error:
            raise RepositoryException(
                ProfileErrors.DB_FETCH_ERROR, error=error
            ) from error
        except Exception as error:
            raise ServiceException(ProfileErrors.FETCH_FAILED, error=error) from error

    @staticmethod
    def upsert_user(db: Session, request: UserUpsertRequest) -> UserResponse:
        """プロフィールを新規作成または更新する。

        Args:
            db: DBセッション。
            request: 保存対象のプロフィール入力値。

        Returns:
            保存後のプロフィール情報。

        Raises:
            RepositoryException: DB保存処理で障害が発生した場合。
            ServiceException: 想定外のサービス層エラーが発生した場合。
        """
        try:
            user_data = UserService._build_user_data(request)
            existing_user = UserRepository.get_first(db)

            if existing_user is None:
                saved_user = UserRepository.create(db, User(**user_data))
            else:
                saved_user = UserRepository.update(db, existing_user, user_data)

            return UserResponse.model_validate(saved_user)
        except AppException:
            raise
        except SQLAlchemyError as error:
            raise RepositoryException(
                ProfileErrors.DB_SAVE_ERROR, error=error
            ) from error
        except Exception as error:
            raise ServiceException(ProfileErrors.SAVE_FAILED, error=error) from error

    @staticmethod
    def _build_user_data(request: UserUpsertRequest) -> dict:
        """保存用のユーザーデータを組み立てる。

        Args:
            request: プロフィール入力値。

        Returns:
            DB保存用の辞書データ。
        """
        basal_metabolism = calculate_basal_metabolism(
            gender=request.gender,
            weight=request.weight,
            height=request.height,
            age=request.age,
        )
        required_calories = calculate_required_calories(
            basal_metabolism=basal_metabolism,
            activity_level=request.activity_level,
        )

        return {
            "height": request.height,
            "weight": request.weight,
            "age": request.age,
            "gender": request.gender,
            "activity_level": request.activity_level,
            "basal_metabolism": basal_metabolism,
            "required_calories": required_calories,
        }
