from datetime import date, datetime
from unittest.mock import patch

import pytest
from common.errors.errors import MealErrors
from common.errors.exceptions import RepositoryException, ServiceException
from models.meal import Meal
from schemas.request.meal_request import MealCreateRequest, MealUpdateRequest
from service.meal_service import MealService
from sqlalchemy.exc import SQLAlchemyError


def test_get_meals_returns_response_list():
    # repository から取得した食事記録を response に変換して返すことを確認する。
    meals = [
        Meal(
            id=1,
            meal_name="Breakfast",
            calories=500,
            eaten_at=datetime(2026, 3, 27, 8, 0, 0),
            memo="Eggs",
        )
    ]

    with patch("service.meal_service.MealRepository.find_by_date", return_value=meals):
        result = MealService.get_meals(object(), date(2026, 3, 27))

    assert len(result) == 1
    assert result[0].id == 1
    assert result[0].meal_name == "Breakfast"
    assert result[0].calories == 500


def test_update_meal_returns_none_when_target_not_found():
    # 更新対象が存在しない場合は None を返すことを確認する。
    request = MealUpdateRequest(
        meal_name="Lunch",
        calories=700,
        eaten_at=datetime(2026, 3, 27, 12, 0, 0),
        memo="Rice bowl",
    )

    with patch("service.meal_service.MealRepository.find_by_id", return_value=None):
        result = MealService.update_meal(object(), 999, request)

    assert result is None


def test_delete_meal_returns_false_when_target_not_found():
    # 削除対象が存在しない場合は False を返すことを確認する。
    with patch("service.meal_service.MealRepository.find_by_id", return_value=None):
        result = MealService.delete_meal(object(), 999)

    assert result is False


def test_get_meals_raises_repository_exception_on_sqlalchemy_error():
    # DB 例外が発生した場合は RepositoryException に変換されることを確認する。
    with patch(
        "service.meal_service.MealRepository.find_by_date",
        side_effect=SQLAlchemyError("db error"),
    ):
        with pytest.raises(RepositoryException) as exc_info:
            MealService.get_meals(object(), date(2026, 3, 27))

    assert exc_info.value.code == MealErrors.DB_FETCH_ERROR.code
    assert exc_info.value.message == MealErrors.DB_FETCH_ERROR.message


def test_create_meal_returns_response():
    # 正常な入力から食事記録を作成し、response を返すことを確認する。
    request = MealCreateRequest(
        meal_name="Lunch",
        calories=700,
        eaten_at=datetime(2026, 3, 27, 12, 0, 0),
        memo="Rice bowl",
    )
    saved_meal = Meal(
        id=1,
        meal_name="Lunch",
        calories=700,
        eaten_at=datetime(2026, 3, 27, 12, 0, 0),
        memo="Rice bowl",
    )

    with patch("service.meal_service.MealRepository.create", return_value=saved_meal):
        result = MealService.create_meal(object(), request)

    assert result.id == 1
    assert result.meal_name == "Lunch"
    assert result.calories == 700


def test_update_meal_returns_response_when_target_exists():
    # 更新対象が存在する場合は更新後の response を返すことを確認する。
    request = MealUpdateRequest(
        meal_name="Dinner",
        calories=800,
        eaten_at=datetime(2026, 3, 27, 19, 0, 0),
        memo="Pasta",
    )
    existing_meal = Meal(
        id=1,
        meal_name="Lunch",
        calories=700,
        eaten_at=datetime(2026, 3, 27, 12, 0, 0),
        memo="Rice bowl",
    )
    updated_meal = Meal(
        id=1,
        meal_name="Dinner",
        calories=800,
        eaten_at=datetime(2026, 3, 27, 19, 0, 0),
        memo="Pasta",
    )

    with (
        patch(
            "service.meal_service.MealRepository.find_by_id", return_value=existing_meal
        ),
        patch(
            "service.meal_service.MealRepository.update",
            return_value=updated_meal,
        ),
    ):
        result = MealService.update_meal(object(), 1, request)

    assert result is not None
    assert result.id == 1
    assert result.meal_name == "Dinner"
    assert result.calories == 800


def test_delete_meal_returns_true_when_target_exists():
    # 削除対象が存在する場合は True を返すことを確認する。
    existing_meal = Meal(
        id=1,
        meal_name="Lunch",
        calories=700,
        eaten_at=datetime(2026, 3, 27, 12, 0, 0),
        memo="Rice bowl",
    )

    with (
        patch(
            "service.meal_service.MealRepository.find_by_id", return_value=existing_meal
        ),
        patch("service.meal_service.MealRepository.delete") as mock_delete,
    ):
        result = MealService.delete_meal(object(), 1)

    assert result is True
    mock_delete.assert_called_once()


def test_get_meals_raises_service_exception_on_unexpected_error():
    # 想定外例外が発生した場合は ServiceException に変換されることを確認する。
    with patch(
        "service.meal_service.MealRepository.find_by_date",
        side_effect=Exception("unexpected"),
    ):
        with pytest.raises(ServiceException) as exc_info:
            MealService.get_meals(object(), date(2026, 3, 27))

    assert exc_info.value.code == MealErrors.FETCH_FAILED.code
    assert exc_info.value.message == MealErrors.FETCH_FAILED.message


def test_create_meal_raises_repository_exception_on_sqlalchemy_error():
    # create 時の DB 例外が RepositoryException に変換されることを確認する。
    request = MealCreateRequest(
        meal_name="Lunch",
        calories=700,
        eaten_at=datetime(2026, 3, 27, 12, 0, 0),
        memo="Rice bowl",
    )

    with patch(
        "service.meal_service.MealRepository.create",
        side_effect=SQLAlchemyError("db error"),
    ):
        with pytest.raises(RepositoryException) as exc_info:
            MealService.create_meal(object(), request)

    assert exc_info.value.code == MealErrors.DB_SAVE_ERROR.code
    assert exc_info.value.message == MealErrors.DB_SAVE_ERROR.message


def test_update_meal_raises_repository_exception_on_sqlalchemy_error():
    # update 時の DB 例外が RepositoryException に変換されることを確認する。
    request = MealUpdateRequest(
        meal_name="Dinner",
        calories=800,
        eaten_at=datetime(2026, 3, 27, 19, 0, 0),
        memo="Pasta",
    )
    existing_meal = Meal(
        id=1,
        meal_name="Lunch",
        calories=700,
        eaten_at=datetime(2026, 3, 27, 12, 0, 0),
        memo="Rice bowl",
    )

    with (
        patch(
            "service.meal_service.MealRepository.find_by_id", return_value=existing_meal
        ),
        patch(
            "service.meal_service.MealRepository.update",
            side_effect=SQLAlchemyError("db error"),
        ),
    ):
        with pytest.raises(RepositoryException) as exc_info:
            MealService.update_meal(object(), 1, request)

    assert exc_info.value.code == MealErrors.DB_UPDATE_ERROR.code
    assert exc_info.value.message == MealErrors.DB_UPDATE_ERROR.message


def test_delete_meal_raises_repository_exception_on_sqlalchemy_error():
    # delete 時の DB 例外が RepositoryException に変換されることを確認する。
    existing_meal = Meal(
        id=1,
        meal_name="Lunch",
        calories=700,
        eaten_at=datetime(2026, 3, 27, 12, 0, 0),
        memo="Rice bowl",
    )

    with (
        patch(
            "service.meal_service.MealRepository.find_by_id", return_value=existing_meal
        ),
        patch(
            "service.meal_service.MealRepository.delete",
            side_effect=SQLAlchemyError("db error"),
        ),
    ):
        with pytest.raises(RepositoryException) as exc_info:
            MealService.delete_meal(object(), 1)

    assert exc_info.value.code == MealErrors.DB_DELETE_ERROR.code
    assert exc_info.value.message == MealErrors.DB_DELETE_ERROR.message
