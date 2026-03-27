from unittest.mock import patch

from common.errors.errors import DashboardErrors, MealErrors
from common.errors.exceptions import NotFoundException, RepositoryException


def test_returns_not_found_response_when_controller_raises_not_found(client):
    # controller が NotFoundException を送出した場合、404 の共通エラーレスポンスを返すことを確認する。
    with patch(
        "application.api.routes.meal_routes.MealController.update_meal_log",
        side_effect=NotFoundException(MealErrors.NOT_FOUND_FOR_UPDATE),
    ):
        response = client.put(
            "/meal-logs/1",
            json={
                "meal_name": "Lunch",
                "calories": 700,
                "eaten_at": "2026-03-27T12:00:00",
                "memo": "Rice bowl",
            },
        )

    assert response.status_code == 404
    assert response.json() == {
        "code": "MEAL-S-0003",
        "message": "MEAL_NOT_FOUND",
    }


def test_returns_internal_server_error_when_controller_raises_repository_exception(
    client,
):
    # controller 経由で RepositoryException が送出された場合、500 の共通エラーレスポンスを返すことを確認する。
    with patch(
        "application.api.routes.dashboard_routes.DashboardController.get_daily_summary",
        side_effect=RepositoryException(DashboardErrors.DB_FETCH_ERROR),
    ):
        response = client.get(
            "/dashboard/daily-summary",
            params={"date": "2026-03-27"},
        )

    assert response.status_code == 500
    assert response.json() == {
        "code": "DASH-R-0001",
        "message": "DB_ERROR",
    }


def test_returns_common_internal_server_error_when_unexpected_exception_occurs(
    client_no_raise,
):
    # 想定外例外が発生した場合、共通の 500 エラーレスポンスを返すことを確認する。
    with patch(
        "application.api.routes.dashboard_routes.DashboardController.get_daily_summary",
        side_effect=Exception("unexpected"),
    ):
        response = client_no_raise.get(
            "/dashboard/daily-summary",
            params={"date": "2026-03-27"},
        )

    assert response.status_code == 500
    assert response.json() == {
        "code": "COMM-C-0001",
        "message": "INTERNAL_SERVER_ERROR",
    }
