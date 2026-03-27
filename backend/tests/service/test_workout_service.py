from datetime import date, datetime
from unittest.mock import patch

import pytest
from common.errors.errors import WorkoutErrors
from common.errors.exceptions import RepositoryException, ServiceException
from models.workout import Workout
from schemas.request.workout_request import WorkoutCreateRequest, WorkoutUpdateRequest
from service.workout_service import WorkoutService
from sqlalchemy.exc import SQLAlchemyError


def test_get_workouts_returns_response_list():
    # repository から取得したトレーニング記録を response に変換して返すことを確認する。
    workouts = [
        Workout(
            id=1,
            workout_name="Bench Press",
            burned_calories=250,
            worked_out_at=datetime(2026, 3, 27, 18, 0, 0),
            memo="Chest day",
        )
    ]

    with patch(
        "service.workout_service.WorkoutRepository.find_by_date",
        return_value=workouts,
    ):
        result = WorkoutService.get_workouts(object(), date(2026, 3, 27))

    assert len(result) == 1
    assert result[0].id == 1
    assert result[0].workout_name == "Bench Press"
    assert result[0].burned_calories == 250


def test_update_workout_returns_none_when_target_not_found():
    # 更新対象が存在しない場合は None を返すことを確認する。
    request = WorkoutUpdateRequest(
        workout_name="Running",
        burned_calories=300,
        worked_out_at=datetime(2026, 3, 27, 19, 0, 0),
        memo="30 min",
    )

    with patch(
        "service.workout_service.WorkoutRepository.find_by_id", return_value=None
    ):
        result = WorkoutService.update_workout(object(), 999, request)

    assert result is None


def test_delete_workout_returns_false_when_target_not_found():
    # 削除対象が存在しない場合は False を返すことを確認する。
    with patch(
        "service.workout_service.WorkoutRepository.find_by_id", return_value=None
    ):
        result = WorkoutService.delete_workout(object(), 999)

    assert result is False


def test_get_workouts_raises_repository_exception_on_sqlalchemy_error():
    # DB 例外が発生した場合は RepositoryException に変換されることを確認する。
    with patch(
        "service.workout_service.WorkoutRepository.find_by_date",
        side_effect=SQLAlchemyError("db error"),
    ):
        with pytest.raises(RepositoryException) as exc_info:
            WorkoutService.get_workouts(object(), date(2026, 3, 27))

    assert exc_info.value.code == WorkoutErrors.DB_FETCH_ERROR.code
    assert exc_info.value.message == WorkoutErrors.DB_FETCH_ERROR.message


def test_create_workout_returns_response():
    # 正常な入力からトレーニング記録を作成し、response を返すことを確認する。
    request = WorkoutCreateRequest(
        workout_name="Running",
        burned_calories=300,
        worked_out_at=datetime(2026, 3, 27, 19, 0, 0),
        memo="30 min",
    )
    saved_workout = Workout(
        id=1,
        workout_name="Running",
        burned_calories=300,
        worked_out_at=datetime(2026, 3, 27, 19, 0, 0),
        memo="30 min",
    )

    with patch(
        "service.workout_service.WorkoutRepository.create",
        return_value=saved_workout,
    ):
        result = WorkoutService.create_workout(object(), request)

    assert result.id == 1
    assert result.workout_name == "Running"
    assert result.burned_calories == 300


def test_update_workout_returns_response_when_target_exists():
    # 更新対象が存在する場合は更新後の response を返すことを確認する。
    request = WorkoutUpdateRequest(
        workout_name="Cycling",
        burned_calories=450,
        worked_out_at=datetime(2026, 3, 27, 20, 0, 0),
        memo="45 min",
    )
    existing_workout = Workout(
        id=1,
        workout_name="Running",
        burned_calories=300,
        worked_out_at=datetime(2026, 3, 27, 19, 0, 0),
        memo="30 min",
    )
    updated_workout = Workout(
        id=1,
        workout_name="Cycling",
        burned_calories=450,
        worked_out_at=datetime(2026, 3, 27, 20, 0, 0),
        memo="45 min",
    )

    with (
        patch(
            "service.workout_service.WorkoutRepository.find_by_id",
            return_value=existing_workout,
        ),
        patch(
            "service.workout_service.WorkoutRepository.update",
            return_value=updated_workout,
        ),
    ):
        result = WorkoutService.update_workout(object(), 1, request)

    assert result is not None
    assert result.id == 1
    assert result.workout_name == "Cycling"
    assert result.burned_calories == 450


def test_delete_workout_returns_true_when_target_exists():
    # 削除対象が存在する場合は True を返すことを確認する。
    existing_workout = Workout(
        id=1,
        workout_name="Running",
        burned_calories=300,
        worked_out_at=datetime(2026, 3, 27, 19, 0, 0),
        memo="30 min",
    )

    with (
        patch(
            "service.workout_service.WorkoutRepository.find_by_id",
            return_value=existing_workout,
        ),
        patch("service.workout_service.WorkoutRepository.delete") as mock_delete,
    ):
        result = WorkoutService.delete_workout(object(), 1)

    assert result is True
    mock_delete.assert_called_once()


def test_get_workouts_raises_service_exception_on_unexpected_error():
    # 想定外例外が発生した場合は ServiceException に変換されることを確認する。
    with patch(
        "service.workout_service.WorkoutRepository.find_by_date",
        side_effect=Exception("unexpected"),
    ):
        with pytest.raises(ServiceException) as exc_info:
            WorkoutService.get_workouts(object(), date(2026, 3, 27))

    assert exc_info.value.code == WorkoutErrors.FETCH_FAILED.code
    assert exc_info.value.message == WorkoutErrors.FETCH_FAILED.message


def test_create_workout_raises_repository_exception_on_sqlalchemy_error():
    # create 時の DB 例外が RepositoryException に変換されることを確認する。
    request = WorkoutCreateRequest(
        workout_name="Running",
        burned_calories=300,
        worked_out_at=datetime(2026, 3, 27, 19, 0, 0),
        memo="30 min",
    )

    with patch(
        "service.workout_service.WorkoutRepository.create",
        side_effect=SQLAlchemyError("db error"),
    ):
        with pytest.raises(RepositoryException) as exc_info:
            WorkoutService.create_workout(object(), request)

    assert exc_info.value.code == WorkoutErrors.DB_SAVE_ERROR.code
    assert exc_info.value.message == WorkoutErrors.DB_SAVE_ERROR.message


def test_update_workout_raises_repository_exception_on_sqlalchemy_error():
    # update 時の DB 例外が RepositoryException に変換されることを確認する。
    request = WorkoutUpdateRequest(
        workout_name="Cycling",
        burned_calories=450,
        worked_out_at=datetime(2026, 3, 27, 20, 0, 0),
        memo="45 min",
    )
    existing_workout = Workout(
        id=1,
        workout_name="Running",
        burned_calories=300,
        worked_out_at=datetime(2026, 3, 27, 19, 0, 0),
        memo="30 min",
    )

    with (
        patch(
            "service.workout_service.WorkoutRepository.find_by_id",
            return_value=existing_workout,
        ),
        patch(
            "service.workout_service.WorkoutRepository.update",
            side_effect=SQLAlchemyError("db error"),
        ),
    ):
        with pytest.raises(RepositoryException) as exc_info:
            WorkoutService.update_workout(object(), 1, request)

    assert exc_info.value.code == WorkoutErrors.DB_UPDATE_ERROR.code
    assert exc_info.value.message == WorkoutErrors.DB_UPDATE_ERROR.message


def test_delete_workout_raises_repository_exception_on_sqlalchemy_error():
    # delete 時の DB 例外が RepositoryException に変換されることを確認する。
    existing_workout = Workout(
        id=1,
        workout_name="Running",
        burned_calories=300,
        worked_out_at=datetime(2026, 3, 27, 19, 0, 0),
        memo="30 min",
    )

    with (
        patch(
            "service.workout_service.WorkoutRepository.find_by_id",
            return_value=existing_workout,
        ),
        patch(
            "service.workout_service.WorkoutRepository.delete",
            side_effect=SQLAlchemyError("db error"),
        ),
    ):
        with pytest.raises(RepositoryException) as exc_info:
            WorkoutService.delete_workout(object(), 1)

    assert exc_info.value.code == WorkoutErrors.DB_DELETE_ERROR.code
    assert exc_info.value.message == WorkoutErrors.DB_DELETE_ERROR.message
