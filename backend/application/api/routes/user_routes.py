from application.api.controllers.user_controller import UserController
from db.session import get_db
from fastapi import APIRouter, Depends
from schemas.request.user_request import UserUpsertRequest
from schemas.response.user_response import UserResponse
from sqlalchemy.orm import Session

router = APIRouter(tags=["profile"])


@router.get("/profile", response_model=UserResponse | None)
def get_profile(db: Session = Depends(get_db)) -> UserResponse | None:
    """プロフィールを取得する。"""

    return UserController.get_profile(db)


@router.put("/profile", response_model=UserResponse)
def upsert_profile(
    request: UserUpsertRequest,
    db: Session = Depends(get_db),
) -> UserResponse:
    """プロフィールを新規作成または更新する。"""

    return UserController.upsert_profile(db, request)
