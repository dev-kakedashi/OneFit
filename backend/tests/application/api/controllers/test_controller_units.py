from datetime import date, datetime
from unittest.mock import patch

import pytest
from application.api.controllers.body_make_plan_controller import BodyMakePlanController
from application.api.controllers.dashboard_controller import DashboardController
from application.api.controllers.meal_controller import MealController
from application.api.controllers.workout_controller import WorkoutController
from common.errors.errors import MealErrors, WorkoutErrors
from common.errors.exceptions import NotFoundException
from enums.goal_course import GoalCourse
from schemas.request.body_make_plan_request import BodyMakePlanUpsertRequest
from schemas.request.meal_request import MealCreateRequest, MealUpdateRequest
from schemas.request.workout_request import WorkoutCreateRequest, WorkoutUpdateRequest
from schemas.response.body_make_plan_response import BodyMakePlanResponse
from schemas.response.dashboard_response import (
    DailySummaryResponse,
    DashboardDailySummaryResponse,
    DashboardMonthlyMarkerResponse,
    DashboardMonthlyMarkersResponse,
)
from schemas.response.meal_response import MealResponse
from schemas.response.workout_response import WorkoutResponse


def test_dashboard_controller_delegates_to_service():
    # dashboard controller が service の結果をそのまま返すことを確認する。
    db = object()
    target_date = date(2026, 3, 27)
    expected = DashboardDailySummaryResponse(
        summary=DailySummaryResponse(
            target_calories=None,
            maintenance_calories=None,
            daily_calorie_adjustment=None,
            intake_calories=0,
            burned_calories=0,
            calorie_balance=None,
            target_water_intake_ml=None,
            water_intake_ml=0,
            remaining_water_intake_ml=None,
            course=None,
            target_end_date=None,
            target_weight_kg=None,
            start_weight_kg=None,
            memo=None,
            body_make_plan_registered=False,
            profile_registered=False,
        )
    )

    with patch(
        "application.api.controllers.dashboard_controller.DashboardService.get_daily_summary",
        return_value=expected,
    ) as mock_get:
        result = DashboardController.get_daily_summary(db, target_date)

    assert result == expected
    mock_get.assert_called_once_with(db, target_date)


def test_dashboard_controller_monthly_markers_delegates_to_service():
    # dashboard controller の月次マーカー取得が service に委譲されることを確認する。
    db = object()
    target_month = date(2026, 3, 1)
    expected = DashboardMonthlyMarkersResponse(
        markers=[
            DashboardMonthlyMarkerResponse(
                date=date(2026, 3, 5),
                has_meal=True,
                has_workout=True,
            )
        ]
    )

    with patch(
        "application.api.controllers.dashboard_controller.DashboardService.get_monthly_markers",
        return_value=expected,
    ) as mock_get:
        result = DashboardController.get_monthly_markers(db, target_month)

    assert result == expected
    mock_get.assert_called_once_with(db, target_month)


def test_body_make_plan_controller_get_latest_delegates_to_service():
    # body make plan controller の最新取得が service に委譲されることを確認する。
    db = object()
    expected = BodyMakePlanResponse(
        id=1,
        user_id=1,
        course=GoalCourse.DIET,
        effective_from=date(2026, 4, 6),
        duration_days=90,
        target_end_date=date(2026, 7, 4),
        target_weight_kg=5,
        memo="夏までに絞る",
        start_weight_kg=70,
        maintenance_calories=2636,
        daily_calorie_adjustment=400,
        target_calories=2236,
    )

    with patch(
        "application.api.controllers.body_make_plan_controller.BodyMakePlanService.get_latest_plan",
        return_value=expected,
    ) as mock_get:
        result = BodyMakePlanController.get_latest_plan(db)

    assert result == expected
    mock_get.assert_called_once_with(db)


def test_body_make_plan_controller_list_delegates_to_service():
    # body make plan controller の一覧取得が service に委譲されることを確認する。
    db = object()
    expected = [
        BodyMakePlanResponse(
            id=1,
            user_id=1,
            course=GoalCourse.MAINTENANCE,
            effective_from=date(2026, 3, 1),
            duration_days=0,
            target_end_date=date(2026, 3, 1),
            target_weight_kg=0,
            memo="現状維持",
            start_weight_kg=70,
            maintenance_calories=2636,
            daily_calorie_adjustment=0,
            target_calories=2636,
        )
    ]

    with patch(
        "application.api.controllers.body_make_plan_controller.BodyMakePlanService.list_plans",
        return_value=expected,
    ) as mock_get:
        result = BodyMakePlanController.list_plans(db)

    assert result == expected
    mock_get.assert_called_once_with(db)


def test_body_make_plan_controller_upsert_delegates_to_service():
    # body make plan controller の保存処理が service に委譲されることを確認する。
    db = object()
    request = BodyMakePlanUpsertRequest(
        course=GoalCourse.DIET,
        effective_from=date(2026, 4, 6),
        target_weight_kg=5,
        duration_days=90,
        memo="夏までに絞る",
    )
    expected = BodyMakePlanResponse(
        id=1,
        user_id=1,
        course=GoalCourse.DIET,
        effective_from=date(2026, 4, 6),
        duration_days=90,
        target_end_date=date(2026, 7, 4),
        target_weight_kg=5,
        memo="夏までに絞る",
        start_weight_kg=70,
        maintenance_calories=2636,
        daily_calorie_adjustment=400,
        target_calories=2236,
    )

    with patch(
        "application.api.controllers.body_make_plan_controller.BodyMakePlanService.upsert_plan",
        return_value=expected,
    ) as mock_put:
        result = BodyMakePlanController.upsert_plan(db, request)

    assert result == expected
    mock_put.assert_called_once_with(db, request)


def test_meal_controller_create_delegates_to_service():
    # meal controller の登録処理が service に委譲されることを確認する。
    db = object()
    request = MealCreateRequest(
        meal_name="Lunch",
        calories=700,
        eaten_at=datetime(2026, 3, 27, 12, 0, 0),
        memo="Rice bowl",
    )
    expected = MealResponse(
        id=1,
        meal_name="Lunch",
        calories=700,
        eaten_at=datetime(2026, 3, 27, 12, 0, 0),
        memo="Rice bowl",
    )

    with patch(
        "application.api.controllers.meal_controller.MealService.create_meal",
        return_value=expected,
    ) as mock_create:
        result = MealController.create_meal_log(db, request)

    assert result == expected
    mock_create.assert_called_once_with(db, request)


def test_meal_controller_update_raises_not_found_when_service_returns_none():
    # meal 更新対象が存在しない場合は NotFoundException を送出することを確認する。
    request = MealUpdateRequest(
        meal_name="Dinner",
        calories=800,
        eaten_at=datetime(2026, 3, 27, 19, 0, 0),
        memo="Pasta",
    )

    with patch(
        "application.api.controllers.meal_controller.MealService.update_meal",
        return_value=None,
    ):
        with pytest.raises(NotFoundException) as exc_info:
            MealController.update_meal_log(object(), 1, request)

    assert exc_info.value.code == MealErrors.NOT_FOUND_FOR_UPDATE.code


def test_meal_controller_delete_raises_not_found_when_service_returns_false():
    # meal 削除対象が存在しない場合は NotFoundException を送出することを確認する。
    with patch(
        "application.api.controllers.meal_controller.MealService.delete_meal",
        return_value=False,
    ):
        with pytest.raises(NotFoundException) as exc_info:
            MealController.delete_meal_log(object(), 1)

    assert exc_info.value.code == MealErrors.NOT_FOUND_FOR_DELETE.code


def test_workout_controller_create_delegates_to_service():
    # workout controller の登録処理が service に委譲されることを確認する。
    db = object()
    request = WorkoutCreateRequest(
        workout_name="Running",
        burned_calories=300,
        worked_out_at=datetime(2026, 3, 27, 19, 0, 0),
        memo="30 min",
    )
    expected = WorkoutResponse(
        id=1,
        workout_name="Running",
        burned_calories=300,
        worked_out_at=datetime(2026, 3, 27, 19, 0, 0),
        memo="30 min",
    )

    with patch(
        "application.api.controllers.workout_controller.WorkoutService.create_workout",
        return_value=expected,
    ) as mock_create:
        result = WorkoutController.create_workout_log(db, request)

    assert result == expected
    mock_create.assert_called_once_with(db, request)


def test_workout_controller_update_raises_not_found_when_service_returns_none():
    # workout 更新対象が存在しない場合は NotFoundException を送出することを確認する。
    request = WorkoutUpdateRequest(
        workout_name="Cycling",
        burned_calories=450,
        worked_out_at=datetime(2026, 3, 27, 20, 0, 0),
        memo="45 min",
    )

    with patch(
        "application.api.controllers.workout_controller.WorkoutService.update_workout",
        return_value=None,
    ):
        with pytest.raises(NotFoundException) as exc_info:
            WorkoutController.update_workout_log(object(), 1, request)

    assert exc_info.value.code == WorkoutErrors.NOT_FOUND_FOR_UPDATE.code


def test_workout_controller_delete_raises_not_found_when_service_returns_false():
    # workout 削除対象が存在しない場合は NotFoundException を送出することを確認する。
    with patch(
        "application.api.controllers.workout_controller.WorkoutService.delete_workout",
        return_value=False,
    ):
        with pytest.raises(NotFoundException) as exc_info:
            WorkoutController.delete_workout_log(object(), 1)

    assert exc_info.value.code == WorkoutErrors.NOT_FOUND_FOR_DELETE.code
