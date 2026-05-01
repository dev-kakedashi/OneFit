from datetime import datetime

from models.body_weight_log import BodyWeightLog
from models.meal import Meal
from models.water_log import WaterLog
from models.workout import Workout


def _create_profile(client) -> None:
    response = client.put(
        "/profile",
        json={
            "height": 175,
            "weight": 70,
            "age": 30,
            "gender": "male",
            "activity_level": "moderate",
            "daily_water_goal_ml": 2000,
        },
    )
    assert response.status_code == 200


def test_get_daily_summary_returns_empty_values_when_no_data(client):
    # 未登録状態でもエラーにせず、空のサマリーを返すことを確認する。
    response = client.get(
        "/dashboard/daily-summary",
        params={"date": "2026-03-27"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "summary": {
            "target_calories": None,
            "maintenance_calories": None,
            "daily_calorie_adjustment": None,
            "intake_calories": 0,
            "burned_calories": 0,
            "calorie_balance": None,
            "target_water_intake_ml": None,
            "water_intake_ml": 0,
            "remaining_water_intake_ml": None,
            "course": None,
            "target_end_date": None,
            "target_weight_kg": None,
            "start_weight_kg": None,
            "memo": None,
            "body_make_plan_registered": False,
            "profile_registered": False,
        }
    }


def test_get_daily_summary_returns_profile_based_summary_when_plan_is_missing(client, db_session):
    # プラン未登録時はプロフィールの必須カロリーと水分目標を使って日次サマリーを返すことを確認する。
    _create_profile(client)

    db_session.add_all(
        [
            WaterLog(
                id=1,
                amount_ml=300,
                drank_at=datetime(2026, 3, 27, 8, 0, 0),
                memo=None,
            ),
            WaterLog(
                id=2,
                amount_ml=500,
                drank_at=datetime(2026, 3, 27, 13, 0, 0),
                memo=None,
            ),
        ]
    )
    db_session.commit()

    response = client.get(
        "/dashboard/daily-summary",
        params={"date": "2026-03-27"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "summary": {
            "target_calories": 2636,
            "maintenance_calories": 2636,
            "daily_calorie_adjustment": 0,
            "intake_calories": 0,
            "burned_calories": 0,
            "calorie_balance": 2636,
            "target_water_intake_ml": 2000,
            "water_intake_ml": 800,
            "remaining_water_intake_ml": 1200,
            "course": None,
            "target_end_date": None,
            "target_weight_kg": None,
            "start_weight_kg": None,
            "memo": None,
            "body_make_plan_registered": False,
            "profile_registered": True,
        }
    }


def test_get_daily_summary_returns_body_make_plan_based_summary(client, db_session):
    # 有効なボディメイク計画がある場合、そのプランの目標値を使って日次サマリーを返すことを確認する。
    _create_profile(client)

    plan_response = client.put(
        "/body-make-plans",
        json={
            "course": "diet",
            "effective_from": "2026-03-20",
            "target_weight_kg": 5,
            "duration_days": 90,
            "memo": "夏までに絞る",
        },
    )
    assert plan_response.status_code == 200

    db_session.add_all(
        [
            Meal(
                id=1,
                meal_name="Breakfast",
                calories=500,
                eaten_at=datetime(2026, 3, 27, 8, 0, 0),
                memo=None,
            ),
            Workout(
                id=1,
                workout_name="Running",
                burned_calories=300,
                worked_out_at=datetime(2026, 3, 27, 19, 0, 0),
                memo=None,
            ),
            WaterLog(
                id=1,
                amount_ml=300,
                drank_at=datetime(2026, 3, 27, 8, 0, 0),
                memo=None,
            ),
            WaterLog(
                id=2,
                amount_ml=500,
                drank_at=datetime(2026, 3, 27, 13, 0, 0),
                memo=None,
            ),
        ]
    )
    db_session.commit()

    response = client.get(
        "/dashboard/daily-summary",
        params={"date": "2026-03-27"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "summary": {
            "target_calories": 2236,
            "maintenance_calories": 2636,
            "daily_calorie_adjustment": 400,
            "intake_calories": 500,
            "burned_calories": 300,
            "calorie_balance": 1736,
            "target_water_intake_ml": 2000,
            "water_intake_ml": 800,
            "remaining_water_intake_ml": 1200,
            "course": "diet",
            "target_end_date": "2026-06-17",
            "target_weight_kg": 5.0,
            "start_weight_kg": 70.0,
            "memo": "夏までに絞る",
            "body_make_plan_registered": True,
            "profile_registered": True,
        }
    }


def test_get_daily_summary_keeps_past_plan_values_when_course_changes(client):
    # コース変更後も、過去日のサマリーは当時の有効プランを使って返ることを確認する。
    _create_profile(client)

    first_response = client.put(
        "/body-make-plans",
        json={
            "course": "diet",
            "effective_from": "2026-03-01",
            "target_weight_kg": 3,
            "duration_days": 30,
            "memo": "春に向けて絞る",
        },
    )
    assert first_response.status_code == 200

    second_response = client.put(
        "/body-make-plans",
        json={
            "course": "bulk",
            "effective_from": "2026-03-20",
            "target_weight_kg": 5,
            "duration_days": 60,
            "memo": "筋量アップ",
        },
    )
    assert second_response.status_code == 200

    old_response = client.get(
        "/dashboard/daily-summary",
        params={"date": "2026-03-15"},
    )
    new_response = client.get(
        "/dashboard/daily-summary",
        params={"date": "2026-03-27"},
    )

    assert old_response.status_code == 200
    assert old_response.json() == {
        "summary": {
            "target_calories": 1916,
            "maintenance_calories": 2636,
            "daily_calorie_adjustment": 720,
            "intake_calories": 0,
            "burned_calories": 0,
            "calorie_balance": 1916,
            "target_water_intake_ml": 2000,
            "water_intake_ml": 0,
            "remaining_water_intake_ml": 2000,
            "course": "diet",
            "target_end_date": "2026-03-30",
            "target_weight_kg": 3.0,
            "start_weight_kg": 70.0,
            "memo": "春に向けて絞る",
            "body_make_plan_registered": True,
            "profile_registered": True,
        }
    }

    assert new_response.status_code == 200
    assert new_response.json() == {
        "summary": {
            "target_calories": 3236,
            "maintenance_calories": 2636,
            "daily_calorie_adjustment": 600,
            "intake_calories": 0,
            "burned_calories": 0,
            "calorie_balance": 3236,
            "target_water_intake_ml": 2000,
            "water_intake_ml": 0,
            "remaining_water_intake_ml": 2000,
            "course": "bulk",
            "target_end_date": "2026-05-18",
            "target_weight_kg": 5.0,
            "start_weight_kg": 70.0,
            "memo": "筋量アップ",
            "body_make_plan_registered": True,
            "profile_registered": True,
        }
    }


def test_get_period_summary_returns_cross_summary(client, db_session):
    # 期間内の食事・運動・水分・体重を横断して集計できることを確認する。
    _create_profile(client)

    db_session.add_all(
        [
            Meal(
                id=1,
                meal_name="Breakfast",
                calories=1200,
                eaten_at=datetime(2026, 3, 23, 8, 0, 0),
                memo=None,
            ),
            Meal(
                id=2,
                meal_name="Dinner",
                calories=500,
                eaten_at=datetime(2026, 3, 24, 19, 0, 0),
                memo=None,
            ),
            Workout(
                id=1,
                workout_name="Running",
                burned_calories=300,
                worked_out_at=datetime(2026, 3, 24, 7, 0, 0),
                memo=None,
            ),
            WaterLog(
                id=1,
                amount_ml=300,
                drank_at=datetime(2026, 3, 23, 8, 0, 0),
                memo=None,
            ),
            WaterLog(
                id=2,
                amount_ml=700,
                drank_at=datetime(2026, 3, 24, 13, 0, 0),
                memo=None,
            ),
            BodyWeightLog(
                id=1,
                user_id=1,
                measured_on=datetime(2026, 3, 23).date(),
                weight_kg=65.2,
                memo=None,
            ),
            BodyWeightLog(
                id=2,
                user_id=1,
                measured_on=datetime(2026, 3, 29).date(),
                weight_kg=64.7,
                memo=None,
            ),
        ]
    )
    db_session.commit()

    response = client.get(
        "/dashboard/period-summary",
        params={"date": "2026-03-25"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "summary": {
            "window_start_date": "2026-03-23",
            "window_end_date": "2026-03-29",
            "window_days": 7,
            "calorie_target_total": 18452,
            "intake_calories": 1700,
            "burned_calories": 300,
            "water_target_total_ml": 14000,
            "water_intake_ml": 1000,
            "meal_log_count": 2,
            "meal_day_count": 2,
            "workout_log_count": 1,
            "workout_day_count": 1,
            "water_log_count": 2,
            "water_day_count": 2,
            "body_weight_log_count": 2,
            "body_weight_day_count": 2,
            "recorded_day_count": 3,
            "body_weight_start_kg": 65.2,
            "body_weight_end_kg": 64.7,
            "body_weight_change_kg": -0.5,
            "profile_registered": True,
        }
    }


def test_get_daily_summary_returns_validation_error_for_invalid_date(client):
    # date の形式が不正な場合、独自エラーコード付きで 422 を返すことを確認する。
    response = client.get(
        "/dashboard/daily-summary",
        params={"date": "invalid-date"},
    )

    assert response.status_code == 422
    assert response.json() == {
        "code": "DASH-A-0001",
        "message": "INVALID_DATE",
    }


def test_get_monthly_markers_returns_dates_with_meal_and_workout_flags(client, db_session):
    # 月内の記録を日付ごとに集約してマーカーとして返すことを確認する。
    db_session.add_all(
        [
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
            Meal(
                id=3,
                meal_name="Next month lunch",
                calories=650,
                eaten_at=datetime(2026, 4, 1, 12, 0, 0),
                memo=None,
            ),
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
    )
    db_session.commit()

    response = client.get(
        "/dashboard/monthly-markers",
        params={"month": "2026-03-01"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "markers": [
            {
                "date": "2026-03-02",
                "has_meal": True,
                "has_workout": False,
            },
            {
                "date": "2026-03-05",
                "has_meal": True,
                "has_workout": True,
            },
            {
                "date": "2026-03-12",
                "has_meal": False,
                "has_workout": True,
            },
        ]
    }


def test_get_monthly_markers_returns_validation_error_for_invalid_month(client):
    # month の形式が不正な場合、独自エラーコード付きで 422 を返すことを確認する。
    response = client.get(
        "/dashboard/monthly-markers",
        params={"month": "invalid-date"},
    )

    assert response.status_code == 422
    assert response.json() == {
        "code": "DASH-A-0001",
        "message": "INVALID_DATE",
    }
