def test_get_profile_returns_none_when_not_registered(client):
    # プロフィール未登録時は 200 で null を返すことを確認する。
    response = client.get("/profile")

    assert response.status_code == 200
    assert response.json() is None


def test_put_profile_returns_validation_error_for_invalid_height(client):
    # height が不正な場合、独自エラーコード付きで 422 を返すことを確認する。
    payload = {
        "height": 0,
        "weight": 70,
        "age": 30,
        "gender": "male",
        "activity_level": "moderate",
        "daily_water_goal_ml": 2000,
    }

    response = client.put("/profile", json=payload)

    assert response.status_code == 422
    assert response.json() == {
        "code": "PROF-V-0001",
        "message": "INVALID_HEIGHT",
    }


def test_put_profile_creates_profile(client):
    # 正常なプロフィール入力で、水分目標を含むプロフィールを新規登録できることを確認する。
    payload = {
        "height": 175,
        "weight": 70,
        "age": 30,
        "gender": "male",
        "activity_level": "moderate",
        "daily_water_goal_ml": 2000,
    }

    response = client.put("/profile", json=payload)

    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "height": 175.0,
        "weight": 70.0,
        "age": 30,
        "gender": "male",
        "activity_level": "moderate",
        "daily_water_goal_ml": 2000,
    }


def test_put_profile_updates_existing_profile(client):
    # 既存プロフィールがある場合、同じユーザーを更新できることを確認する。
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

    response = client.put(
        "/profile",
        json={
            "height": 165,
            "weight": 55,
            "age": 28,
            "gender": "female",
            "activity_level": "light",
            "daily_water_goal_ml": 1800,
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "height": 165.0,
        "weight": 55.0,
        "age": 28,
        "gender": "female",
        "activity_level": "light",
        "daily_water_goal_ml": 1800,
    }


def test_put_profile_returns_validation_error_for_invalid_gender(client):
    # gender が不正な場合、独自エラーコード付きで 422 を返すことを確認する。
    payload = {
        "height": 175,
        "weight": 70,
        "age": 30,
        "gender": "invalid",
        "activity_level": "moderate",
        "daily_water_goal_ml": 2000,
    }

    response = client.put("/profile", json=payload)

    assert response.status_code == 422
    assert response.json() == {
        "code": "PROF-V-0004",
        "message": "INVALID_GENDER",
    }


def test_put_profile_returns_validation_error_for_invalid_daily_water_goal(client):
    # daily_water_goal_ml が不正な場合、独自エラーコード付きで 422 を返すことを確認する。
    payload = {
        "height": 175,
        "weight": 70,
        "age": 30,
        "gender": "male",
        "activity_level": "moderate",
        "daily_water_goal_ml": 0,
    }

    response = client.put("/profile", json=payload)

    assert response.status_code == 422
    assert response.json() == {
        "code": "PROF-V-0006",
        "message": "INVALID_DAILY_WATER_GOAL",
    }
