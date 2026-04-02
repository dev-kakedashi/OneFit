from datetime import date, datetime
from unittest.mock import patch

import pytest
from common.errors.errors import WaterErrors
from common.errors.exceptions import RepositoryException, ServiceException
from models.water_log import WaterLog
from schemas.request.water_request import WaterLogCreateRequest, WaterLogUpdateRequest
from service.water_service import WaterService
from sqlalchemy.exc import SQLAlchemyError


def test_get_water_logs_returns_response_list():
    # repository から取得した水分記録を response に変換して返すことを確認する。
    water_logs = [
        WaterLog(
            id=1,
            amount_ml=300,
            drank_at=datetime(2026, 3, 27, 8, 0, 0),
            memo="Water",
        )
    ]

    with patch(
        "service.water_service.WaterRepository.find_by_date",
        return_value=water_logs,
    ):
        result = WaterService.get_water_logs(object(), date(2026, 3, 27))

    assert len(result) == 1
    assert result[0].id == 1
    assert result[0].amount_ml == 300


def test_update_water_log_returns_none_when_target_not_found():
    # 更新対象が存在しない場合は None を返すことを確認する。
    request = WaterLogUpdateRequest(
        amount_ml=500,
        drank_at=datetime(2026, 3, 27, 12, 0, 0),
        memo="Tea",
    )

    with patch("service.water_service.WaterRepository.find_by_id", return_value=None):
        result = WaterService.update_water_log(object(), 999, request)

    assert result is None


def test_delete_water_log_returns_false_when_target_not_found():
    # 削除対象が存在しない場合は False を返すことを確認する。
    with patch("service.water_service.WaterRepository.find_by_id", return_value=None):
        result = WaterService.delete_water_log(object(), 999)

    assert result is False


def test_get_water_logs_raises_repository_exception_on_sqlalchemy_error():
    # DB 例外が発生した場合は RepositoryException に変換されることを確認する。
    with patch(
        "service.water_service.WaterRepository.find_by_date",
        side_effect=SQLAlchemyError("db error"),
    ):
        with pytest.raises(RepositoryException) as exc_info:
            WaterService.get_water_logs(object(), date(2026, 3, 27))

    assert exc_info.value.code == WaterErrors.DB_FETCH_ERROR.code
    assert exc_info.value.message == WaterErrors.DB_FETCH_ERROR.message


def test_create_water_log_returns_response():
    # 正常な入力から水分記録を作成し、response を返すことを確認する。
    request = WaterLogCreateRequest(
        amount_ml=300,
        drank_at=datetime(2026, 3, 27, 8, 0, 0),
        memo="Water",
    )
    saved_water_log = WaterLog(
        id=1,
        amount_ml=300,
        drank_at=datetime(2026, 3, 27, 8, 0, 0),
        memo="Water",
    )

    with patch(
        "service.water_service.WaterRepository.create",
        return_value=saved_water_log,
    ):
        result = WaterService.create_water_log(object(), request)

    assert result.id == 1
    assert result.amount_ml == 300


def test_update_water_log_returns_response_when_target_exists():
    # 更新対象が存在する場合は更新後の response を返すことを確認する。
    request = WaterLogUpdateRequest(
        amount_ml=500,
        drank_at=datetime(2026, 3, 27, 12, 0, 0),
        memo="Tea",
    )
    existing_water_log = WaterLog(
        id=1,
        amount_ml=300,
        drank_at=datetime(2026, 3, 27, 8, 0, 0),
        memo="Water",
    )
    updated_water_log = WaterLog(
        id=1,
        amount_ml=500,
        drank_at=datetime(2026, 3, 27, 12, 0, 0),
        memo="Tea",
    )

    with (
        patch(
            "service.water_service.WaterRepository.find_by_id",
            return_value=existing_water_log,
        ),
        patch(
            "service.water_service.WaterRepository.update",
            return_value=updated_water_log,
        ),
    ):
        result = WaterService.update_water_log(object(), 1, request)

    assert result is not None
    assert result.id == 1
    assert result.amount_ml == 500


def test_delete_water_log_returns_true_when_target_exists():
    # 削除対象が存在する場合は True を返すことを確認する。
    existing_water_log = WaterLog(
        id=1,
        amount_ml=300,
        drank_at=datetime(2026, 3, 27, 8, 0, 0),
        memo="Water",
    )

    with (
        patch(
            "service.water_service.WaterRepository.find_by_id",
            return_value=existing_water_log,
        ),
        patch("service.water_service.WaterRepository.delete") as mock_delete,
    ):
        result = WaterService.delete_water_log(object(), 1)

    assert result is True
    mock_delete.assert_called_once()


def test_get_water_logs_raises_service_exception_on_unexpected_error():
    # 想定外例外が発生した場合は ServiceException に変換されることを確認する。
    with patch(
        "service.water_service.WaterRepository.find_by_date",
        side_effect=Exception("unexpected"),
    ):
        with pytest.raises(ServiceException) as exc_info:
            WaterService.get_water_logs(object(), date(2026, 3, 27))

    assert exc_info.value.code == WaterErrors.FETCH_FAILED.code
    assert exc_info.value.message == WaterErrors.FETCH_FAILED.message


def test_create_water_log_raises_repository_exception_on_sqlalchemy_error():
    # create 時の DB 例外が RepositoryException に変換されることを確認する。
    request = WaterLogCreateRequest(
        amount_ml=300,
        drank_at=datetime(2026, 3, 27, 8, 0, 0),
        memo="Water",
    )

    with patch(
        "service.water_service.WaterRepository.create",
        side_effect=SQLAlchemyError("db error"),
    ):
        with pytest.raises(RepositoryException) as exc_info:
            WaterService.create_water_log(object(), request)

    assert exc_info.value.code == WaterErrors.DB_SAVE_ERROR.code
    assert exc_info.value.message == WaterErrors.DB_SAVE_ERROR.message


def test_update_water_log_raises_repository_exception_on_sqlalchemy_error():
    # update 時の DB 例外が RepositoryException に変換されることを確認する。
    request = WaterLogUpdateRequest(
        amount_ml=500,
        drank_at=datetime(2026, 3, 27, 12, 0, 0),
        memo="Tea",
    )
    existing_water_log = WaterLog(
        id=1,
        amount_ml=300,
        drank_at=datetime(2026, 3, 27, 8, 0, 0),
        memo="Water",
    )

    with (
        patch(
            "service.water_service.WaterRepository.find_by_id",
            return_value=existing_water_log,
        ),
        patch(
            "service.water_service.WaterRepository.update",
            side_effect=SQLAlchemyError("db error"),
        ),
    ):
        with pytest.raises(RepositoryException) as exc_info:
            WaterService.update_water_log(object(), 1, request)

    assert exc_info.value.code == WaterErrors.DB_UPDATE_ERROR.code
    assert exc_info.value.message == WaterErrors.DB_UPDATE_ERROR.message


def test_delete_water_log_raises_repository_exception_on_sqlalchemy_error():
    # delete 時の DB 例外が RepositoryException に変換されることを確認する。
    existing_water_log = WaterLog(
        id=1,
        amount_ml=300,
        drank_at=datetime(2026, 3, 27, 8, 0, 0),
        memo="Water",
    )

    with (
        patch(
            "service.water_service.WaterRepository.find_by_id",
            return_value=existing_water_log,
        ),
        patch(
            "service.water_service.WaterRepository.delete",
            side_effect=SQLAlchemyError("db error"),
        ),
    ):
        with pytest.raises(RepositoryException) as exc_info:
            WaterService.delete_water_log(object(), 1)

    assert exc_info.value.code == WaterErrors.DB_DELETE_ERROR.code
    assert exc_info.value.message == WaterErrors.DB_DELETE_ERROR.message
