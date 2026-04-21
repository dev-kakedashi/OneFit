from datetime import date, datetime
from unittest.mock import patch

import pytest
from common.errors.errors import DashboardErrors
from common.errors.exceptions import RepositoryException, ServiceException
from enums.activity_level import ActivityLevel
from enums.gender import Gender
from enums.goal_course import GoalCourse
from models.body_make_plan import BodyMakePlan
from models.meal import Meal
from models.user import User
from models.water_log import WaterLog
from models.workout import Workout
from service.dashboard_service import DashboardService
from sqlalchemy.exc import SQLAlchemyError


def _user() -> User:
    return User(
        id=1,
        height=175,
        weight=70,
        age=30,
        gender=Gender.MALE,
        activity_level=ActivityLevel.MODERATE,
        basal_metabolism=1701,
        required_calories=2636,
        daily_water_goal_ml=2000,
    )


def test_get_daily_summary_returns_empty_summary_when_no_data():
    # 未登録状態でも空のサマリーを返すことを確認する。
    with (
        patch("service.dashboard_service.UserRepository.get_first", return_value=None),
        patch("service.dashboard_service.MealRepository.find_by_date", return_value=[]),
        patch("service.dashboard_service.WorkoutRepository.find_by_date", return_value=[]),
        patch("service.dashboard_service.WaterRepository.find_by_date", return_value=[]),
    ):
        result = DashboardService.get_daily_summary(object(), date(2026, 3, 27))

    assert result.summary.target_calories is None
    assert result.summary.maintenance_calories is None
    assert result.summary.daily_calorie_adjustment is None
    assert result.summary.intake_calories == 0
    assert result.summary.burned_calories == 0
    assert result.summary.calorie_balance is None
    assert result.summary.target_water_intake_ml is None
    assert result.summary.water_intake_ml == 0
    assert result.summary.remaining_water_intake_ml is None
    assert result.summary.course is None
    assert result.summary.target_end_date is None
    assert result.summary.target_weight_kg is None
    assert result.summary.start_weight_kg is None
    assert result.summary.memo is None
    assert result.summary.body_make_plan_registered is False
    assert result.summary.profile_registered is False


def test_get_daily_summary_returns_profile_based_summary_when_plan_is_missing():
    # プラン未登録時はプロフィールの必須カロリーと水分目標を使って集計することを確認する。
    meals = [
        Meal(
            id=1,
            meal_name="Breakfast",
            calories=500,
            eaten_at=datetime(2026, 3, 27, 8, 0, 0),
            memo=None,
        ),
        Meal(
            id=2,
            meal_name="Lunch",
            calories=800,
            eaten_at=datetime(2026, 3, 27, 12, 0, 0),
            memo=None,
        ),
    ]
    workouts = [
        Workout(
            id=1,
            workout_name="Running",
            burned_calories=300,
            worked_out_at=datetime(2026, 3, 27, 19, 0, 0),
            memo=None,
        )
    ]
    water_logs = [
        WaterLog(
            id=1,
            amount_ml=300,
            drank_at=datetime(2026, 3, 27, 8, 0, 0),
            memo=None,
        ),
        WaterLog(
            id=2,
            amount_ml=700,
            drank_at=datetime(2026, 3, 27, 13, 0, 0),
            memo=None,
        ),
    ]

    with (
        patch("service.dashboard_service.UserRepository.get_first", return_value=_user()),
        patch(
            "service.dashboard_service.BodyMakePlanRepository.find_effective_on_date",
            return_value=None,
        ),
        patch("service.dashboard_service.MealRepository.find_by_date", return_value=meals),
        patch("service.dashboard_service.WorkoutRepository.find_by_date", return_value=workouts),
        patch("service.dashboard_service.WaterRepository.find_by_date", return_value=water_logs),
    ):
        result = DashboardService.get_daily_summary(object(), date(2026, 3, 27))

    assert result.summary.target_calories == 2636
    assert result.summary.maintenance_calories == 2636
    assert result.summary.daily_calorie_adjustment == 0
    assert result.summary.intake_calories == 1300
    assert result.summary.burned_calories == 300
    assert result.summary.calorie_balance == -1636
    assert result.summary.target_water_intake_ml == 2000
    assert result.summary.water_intake_ml == 1000
    assert result.summary.remaining_water_intake_ml == 1000
    assert result.summary.course is None
    assert result.summary.target_end_date is None
    assert result.summary.target_weight_kg is None
    assert result.summary.start_weight_kg is None
    assert result.summary.memo is None
    assert result.summary.body_make_plan_registered is False
    assert result.summary.profile_registered is True


def test_get_daily_summary_returns_plan_based_summary():
    # プラン登録済みの場合は、当日の有効プランの目標値を使って集計することを確認する。
    plan = BodyMakePlan(
        id=1,
        user_id=1,
        course=GoalCourse.DIET,
        effective_from=date(2026, 3, 20),
        duration_days=90,
        target_end_date=date(2026, 6, 17),
        target_weight_kg=5,
        memo="夏までに絞る",
        start_weight_kg=70,
        maintenance_calories=2636,
        daily_calorie_adjustment=400,
        target_calories=2236,
    )
    meals = [
        Meal(
            id=1,
            meal_name="Breakfast",
            calories=500,
            eaten_at=datetime(2026, 3, 27, 8, 0, 0),
            memo=None,
        ),
        Meal(
            id=2,
            meal_name="Lunch",
            calories=800,
            eaten_at=datetime(2026, 3, 27, 12, 0, 0),
            memo=None,
        ),
    ]
    workouts = [
        Workout(
            id=1,
            workout_name="Running",
            burned_calories=300,
            worked_out_at=datetime(2026, 3, 27, 19, 0, 0),
            memo=None,
        )
    ]
    water_logs = [
        WaterLog(
            id=1,
            amount_ml=300,
            drank_at=datetime(2026, 3, 27, 8, 0, 0),
            memo=None,
        ),
        WaterLog(
            id=2,
            amount_ml=700,
            drank_at=datetime(2026, 3, 27, 13, 0, 0),
            memo=None,
        ),
    ]

    with (
        patch("service.dashboard_service.UserRepository.get_first", return_value=_user()),
        patch(
            "service.dashboard_service.BodyMakePlanRepository.find_effective_on_date",
            return_value=plan,
        ),
        patch("service.dashboard_service.MealRepository.find_by_date", return_value=meals),
        patch("service.dashboard_service.WorkoutRepository.find_by_date", return_value=workouts),
        patch("service.dashboard_service.WaterRepository.find_by_date", return_value=water_logs),
    ):
        result = DashboardService.get_daily_summary(object(), date(2026, 3, 27))

    assert result.summary.target_calories == 2236
    assert result.summary.maintenance_calories == 2636
    assert result.summary.daily_calorie_adjustment == 400
    assert result.summary.intake_calories == 1300
    assert result.summary.burned_calories == 300
    assert result.summary.calorie_balance == -1236
    assert result.summary.target_water_intake_ml == 2000
    assert result.summary.water_intake_ml == 1000
    assert result.summary.remaining_water_intake_ml == 1000
    assert result.summary.course == GoalCourse.DIET
    assert result.summary.target_end_date == date(2026, 6, 17)
    assert result.summary.target_weight_kg == 5
    assert result.summary.start_weight_kg == 70
    assert result.summary.memo == "夏までに絞る"
    assert result.summary.body_make_plan_registered is True
    assert result.summary.profile_registered is True


def test_get_daily_summary_raises_repository_exception_on_sqlalchemy_error():
    # DB 例外が発生した場合は RepositoryException に変換されることを確認する。
    with patch(
        "service.dashboard_service.UserRepository.get_first",
        side_effect=SQLAlchemyError("db error"),
    ):
        with pytest.raises(RepositoryException) as exc_info:
            DashboardService.get_daily_summary(object(), date(2026, 3, 27))

    assert exc_info.value.code == DashboardErrors.DB_FETCH_ERROR.code
    assert exc_info.value.message == DashboardErrors.DB_FETCH_ERROR.message


def test_get_daily_summary_raises_service_exception_on_unexpected_error():
    # 想定外例外が発生した場合は ServiceException に変換されることを確認する。
    with (
        patch("service.dashboard_service.UserRepository.get_first", return_value=None),
        patch(
            "service.dashboard_service.MealRepository.find_by_date",
            side_effect=Exception("unexpected"),
        ),
    ):
        with pytest.raises(ServiceException) as exc_info:
            DashboardService.get_daily_summary(object(), date(2026, 3, 27))

    assert exc_info.value.code == DashboardErrors.FETCH_FAILED.code
    assert exc_info.value.message == DashboardErrors.FETCH_FAILED.message


def test_get_monthly_markers_returns_empty_markers_when_no_data():
    # 月内に記録がない場合は空のマーカー一覧を返すことを確認する。
    with (
        patch("service.dashboard_service.MealRepository.find_in_range", return_value=[]),
        patch("service.dashboard_service.WorkoutRepository.find_in_range", return_value=[]),
    ):
        result = DashboardService.get_monthly_markers(object(), date(2026, 3, 27))

    assert result.markers == []


def test_get_monthly_markers_merges_meal_and_workout_dates():
    # 同じ日付の食事と運動を 1 つのマーカーへ集約できることを確認する。
    meals = [
        Meal(
            id=1,
            meal_name="Breakfast",
            calories=500,
            eaten_at=datetime(2026, 3, 2, 8, 0, 0),
            memo=None,
        ),
        Meal(
            id=2,
            meal_name="Dinner",
            calories=700,
            eaten_at=datetime(2026, 3, 5, 19, 0, 0),
            memo=None,
        ),
    ]
    workouts = [
        Workout(
            id=1,
            workout_name="Running",
            burned_calories=300,
            worked_out_at=datetime(2026, 3, 5, 7, 0, 0),
            memo=None,
        ),
        Workout(
            id=2,
            workout_name="Cycling",
            burned_calories=450,
            worked_out_at=datetime(2026, 3, 12, 20, 0, 0),
            memo=None,
        ),
    ]

    with (
        patch("service.dashboard_service.MealRepository.find_in_range", return_value=meals),
        patch("service.dashboard_service.WorkoutRepository.find_in_range", return_value=workouts),
    ):
        result = DashboardService.get_monthly_markers(object(), date(2026, 3, 27))

    assert [marker.date.isoformat() for marker in result.markers] == [
        "2026-03-02",
        "2026-03-05",
        "2026-03-12",
    ]
    assert [(marker.has_meal, marker.has_workout) for marker in result.markers] == [
        (True, False),
        (True, True),
        (False, True),
    ]


def test_get_monthly_markers_raises_repository_exception_on_sqlalchemy_error():
    # DB 例外が発生した場合は RepositoryException に変換されることを確認する。
    with patch(
        "service.dashboard_service.MealRepository.find_in_range",
        side_effect=SQLAlchemyError("db error"),
    ):
        with pytest.raises(RepositoryException) as exc_info:
            DashboardService.get_monthly_markers(object(), date(2026, 3, 27))

    assert exc_info.value.code == DashboardErrors.DB_FETCH_ERROR.code
    assert exc_info.value.message == DashboardErrors.DB_FETCH_ERROR.message


def test_get_monthly_markers_raises_service_exception_on_unexpected_error():
    # 想定外例外が発生した場合は ServiceException に変換されることを確認する。
    with patch(
        "service.dashboard_service.MealRepository.find_in_range",
        side_effect=Exception("unexpected"),
    ):
        with pytest.raises(ServiceException) as exc_info:
            DashboardService.get_monthly_markers(object(), date(2026, 3, 27))

    assert exc_info.value.code == DashboardErrors.FETCH_FAILED.code
    assert exc_info.value.message == DashboardErrors.FETCH_FAILED.message
