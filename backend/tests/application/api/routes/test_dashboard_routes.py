from datetime import datetime

from models.meal import Meal
from models.water_log import WaterLog
from models.workout import Workout


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
            "intake_calories": 0,
            "burned_calories": 0,
            "calorie_balance": None,
            "target_water_intake_ml": None,
            "water_intake_ml": 0,
            "remaining_water_intake_ml": None,
            "profile_registered": False,
        }
    }


def test_get_daily_summary_returns_profile_based_summary(client, db_session):
    # プロフィール登録後は、水分目標を含む日次サマリーを返すことを確認する。
    client.put(
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
            "intake_calories": 0,
            "burned_calories": 0,
            "calorie_balance": -2636,
            "target_water_intake_ml": 2000,
            "water_intake_ml": 800,
            "remaining_water_intake_ml": 1200,
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


def test_get_monthly_markers_returns_dates_with_meal_and_workout_flags(
    client,
    db_session,
):
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
