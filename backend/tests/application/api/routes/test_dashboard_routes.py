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
            "profile_registered": False,
        }
    }


def test_get_daily_summary_returns_profile_based_summary(client):
    # プロフィール登録後は、目標カロリーと収支を含むサマリーを返すことを確認する。
    client.put(
        "/profile",
        json={
            "height": 175,
            "weight": 70,
            "age": 30,
            "gender": "male",
            "activity_level": "moderate",
        },
    )

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
