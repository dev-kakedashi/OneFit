import asyncio
import json
from types import SimpleNamespace

from application.main import (
    _first_field_name,
    _route_path,
    app_exception_handler,
    not_found_exception_handler,
    unexpected_exception_handler,
    validation_exception_handler,
)
from common.errors.errors import (
    CommonErrors,
    DashboardErrors,
    MealErrors,
    ProfileErrors,
)
from common.errors.exceptions import (
    NotFoundException,
    RepositoryException,
    ValidationException,
)
from fastapi.exceptions import RequestValidationError


def _request(path: str = "/test", method: str = "GET", route: object | None = None):
    return SimpleNamespace(
        scope={} if route is None else {"route": route},
        url=SimpleNamespace(path=path),
        method=method,
    )


def test_route_path_returns_url_path_when_route_is_missing():
    # route 情報が無い場合は URL パスを返すことを確認する。
    assert _route_path(_request(path="/fallback")) == "/fallback"


def test_first_field_name_returns_none_when_errors_are_empty():
    # バリデーションエラーが空の場合は None を返すことを確認する。
    assert _first_field_name(RequestValidationError([])) is None


def test_first_field_name_returns_none_when_loc_has_no_field():
    # loc にフィールド名が含まれない場合は None を返すことを確認する。
    exc = RequestValidationError(
        [{"loc": ("body",), "msg": "error", "type": "value_error"}]
    )
    assert _first_field_name(exc) is None


def test_validation_exception_handler_returns_error_response():
    # ValidationException を 422 の共通エラーレスポンスへ変換することを確認する。
    response = asyncio.run(
        validation_exception_handler(
            _request(path="/profile", method="PUT"),
            ValidationException(ProfileErrors.INVALID_HEIGHT),
        )
    )
    assert response.status_code == 422
    assert json.loads(response.body) == {
        "code": "PROF-V-0001",
        "message": "INVALID_HEIGHT",
    }


def test_not_found_exception_handler_returns_error_response():
    # NotFoundException を 404 の共通エラーレスポンスへ変換することを確認する。
    response = asyncio.run(
        not_found_exception_handler(
            _request(path="/meal-logs/1", method="PUT"),
            NotFoundException(MealErrors.NOT_FOUND_FOR_UPDATE),
        )
    )
    assert response.status_code == 404
    assert json.loads(response.body) == {
        "code": "MEAL-S-0003",
        "message": "MEAL_NOT_FOUND",
    }


def test_app_exception_handler_returns_error_response():
    # RepositoryException を 500 の共通エラーレスポンスへ変換することを確認する。
    response = asyncio.run(
        app_exception_handler(
            _request(path="/dashboard/daily-summary", method="GET"),
            RepositoryException(DashboardErrors.DB_FETCH_ERROR),
        )
    )
    assert response.status_code == 500
    assert json.loads(response.body) == {"code": "DASH-R-0001", "message": "DB_ERROR"}


def test_unexpected_exception_handler_returns_error_response():
    # 想定外例外を共通の 500 エラーレスポンスへ変換することを確認する。
    try:
        raise ValueError("boom")
    except ValueError as error:
        response = asyncio.run(
            unexpected_exception_handler(
                _request(path="/dashboard/daily-summary", method="GET"),
                error,
            )
        )

    assert response.status_code == 500
    assert json.loads(response.body) == {
        "code": CommonErrors.INTERNAL_SERVER_ERROR.code,
        "message": CommonErrors.INTERNAL_SERVER_ERROR.message,
    }
