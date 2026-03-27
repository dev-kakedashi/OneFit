from unittest.mock import patch

import pytest
from common.errors.errors import ProfileErrors
from common.errors.exceptions import RepositoryException, ServiceException
from enums.activity_level import ActivityLevel
from enums.gender import Gender
from models.user import User
from schemas.request.user_request import UserUpsertRequest
from service.user_service import UserService
from sqlalchemy.exc import SQLAlchemyError


def test_get_user_returns_none_when_not_registered():
    # プロフィール未登録時は None を返すことを確認する。
    with patch("service.user_service.UserRepository.get_first", return_value=None):
        result = UserService.get_user(object())

    assert result is None


def test_upsert_user_creates_profile_with_calculated_values():
    # 新規作成時に計算済みの基礎代謝と必須カロリーが保存データに含まれることを確認する。
    request = UserUpsertRequest(
        height=175,
        weight=70,
        age=30,
        gender=Gender.MALE,
        activity_level=ActivityLevel.MODERATE,
    )
    saved_user = User(
        id=1,
        height=175,
        weight=70,
        age=30,
        gender=Gender.MALE,
        activity_level=ActivityLevel.MODERATE,
        basal_metabolism=1701,
        required_calories=2636,
    )

    with (
        patch("service.user_service.UserRepository.get_first", return_value=None),
        patch(
            "service.user_service.UserRepository.create",
            return_value=saved_user,
        ) as mock_create,
    ):
        result = UserService.upsert_user(object(), request)

    created_user = mock_create.call_args[0][1]
    assert created_user.basal_metabolism == 1701
    assert created_user.required_calories == 2636
    assert result.id == 1
    assert result.gender == Gender.MALE


def test_get_user_raises_repository_exception_on_sqlalchemy_error():
    # DB 例外が発生した場合は RepositoryException に変換されることを確認する。
    with patch(
        "service.user_service.UserRepository.get_first",
        side_effect=SQLAlchemyError("db error"),
    ):
        with pytest.raises(RepositoryException) as exc_info:
            UserService.get_user(object())

    assert exc_info.value.code == ProfileErrors.DB_FETCH_ERROR.code
    assert exc_info.value.message == ProfileErrors.DB_FETCH_ERROR.message


def test_upsert_user_updates_existing_profile():
    # 既存プロフィールがある場合は更新処理が呼ばれ、更新後の response を返すことを確認する。
    request = UserUpsertRequest(
        height=165,
        weight=55,
        age=28,
        gender=Gender.FEMALE,
        activity_level=ActivityLevel.LIGHT,
    )
    existing_user = User(
        id=1,
        height=175,
        weight=70,
        age=30,
        gender=Gender.MALE,
        activity_level=ActivityLevel.MODERATE,
        basal_metabolism=1701,
        required_calories=2636,
    )
    updated_user = User(
        id=1,
        height=165,
        weight=55,
        age=28,
        gender=Gender.FEMALE,
        activity_level=ActivityLevel.LIGHT,
        basal_metabolism=1355,
        required_calories=1863,
    )

    with (
        patch(
            "service.user_service.UserRepository.get_first", return_value=existing_user
        ),
        patch(
            "service.user_service.UserRepository.update",
            return_value=updated_user,
        ) as mock_update,
    ):
        result = UserService.upsert_user(object(), request)

    update_data = mock_update.call_args[0][2]
    assert update_data["basal_metabolism"] == 1355
    assert update_data["required_calories"] == 1863
    assert result.id == 1
    assert result.gender == Gender.FEMALE


def test_upsert_user_raises_repository_exception_on_sqlalchemy_error():
    # DB 例外が発生した場合は RepositoryException に変換されることを確認する。
    request = UserUpsertRequest(
        height=175,
        weight=70,
        age=30,
        gender=Gender.MALE,
        activity_level=ActivityLevel.MODERATE,
    )

    with patch(
        "service.user_service.UserRepository.get_first",
        side_effect=SQLAlchemyError("db error"),
    ):
        with pytest.raises(RepositoryException) as exc_info:
            UserService.upsert_user(object(), request)

    assert exc_info.value.code == ProfileErrors.DB_SAVE_ERROR.code
    assert exc_info.value.message == ProfileErrors.DB_SAVE_ERROR.message


def test_upsert_user_raises_service_exception_on_unexpected_error():
    # 想定外例外が発生した場合は ServiceException に変換されることを確認する。
    request = UserUpsertRequest(
        height=175,
        weight=70,
        age=30,
        gender=Gender.MALE,
        activity_level=ActivityLevel.MODERATE,
    )

    with patch(
        "service.user_service.UserRepository.get_first",
        side_effect=Exception("unexpected"),
    ):
        with pytest.raises(ServiceException) as exc_info:
            UserService.upsert_user(object(), request)

    assert exc_info.value.code == ProfileErrors.SAVE_FAILED.code
    assert exc_info.value.message == ProfileErrors.SAVE_FAILED.message
