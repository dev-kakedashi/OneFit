from schemas.request.user_request import UserUpsertRequest
from schemas.response.user_response import UserResponse
from service.user_service import UserService
from sqlalchemy.orm import Session


class UserController:
    """プロフィールAPIのリクエストをサービスへ橋渡しするコントローラー。"""

    @staticmethod
    def get_profile(db: Session) -> UserResponse | None:
        """登録済みプロフィールを取得する。"""

        return UserService.get_user(db)

    @staticmethod
    def upsert_profile(db: Session, request: UserUpsertRequest) -> UserResponse:
        """プロフィールを新規作成または更新する。"""

        return UserService.upsert_user(db, request)
