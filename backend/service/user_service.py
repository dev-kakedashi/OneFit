from domain.user.calculators import (
    calculate_basal_metabolism,
    calculate_required_calories,
)
from models.user import User
from repository.user_repository import UserRepository
from schemas.request.user_request import UserUpsertRequest
from schemas.response.user_response import UserResponse
from sqlalchemy.orm import Session


class UserService:
    """ユーザー情報の取得・保存と、身体指標の計算を担当するサービス。"""

    @staticmethod
    def get_user(db: Session) -> UserResponse | None:
        """登録済みユーザーを1件取得し、レスポンス形式で返す。"""

        user = UserRepository.get_first(db)
        if user is None:
            return None

        return UserResponse.model_validate(user)

    @staticmethod
    def upsert_user(db: Session, request: UserUpsertRequest) -> UserResponse:
        """ユーザー情報を新規作成または更新し、保存結果を返す。"""

        user_data = UserService._build_user_data(request)
        existing_user = UserRepository.get_first(db)

        if existing_user is None:
            saved_user = UserRepository.create(db, User(**user_data))
        else:
            saved_user = UserRepository.update(db, existing_user, user_data)

        return UserResponse.model_validate(saved_user)

    @staticmethod
    def _build_user_data(request: UserUpsertRequest) -> dict:
        """リクエストから保存用のユーザーデータを組み立てる。"""

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
