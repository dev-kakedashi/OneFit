def _create_profile(
    client,
    *,
    height: int = 175,
    weight: int = 70,
    age: int = 30,
    gender: str = "male",
    activity_level: str = "moderate",
    daily_water_goal_ml: int = 2000,
) -> None:
    response = client.put(
        "/profile",
        json={
            "height": height,
            "weight": weight,
            "age": age,
            "gender": gender,
            "activity_level": activity_level,
            "daily_water_goal_ml": daily_water_goal_ml,
        },
    )
    assert response.status_code == 200


def test_get_latest_body_make_plan_returns_none_when_not_registered(client):
    # プロフィール未登録時は最新プラン取得で null を返すことを確認する。
    response = client.get("/body-make-plans/latest")

    assert response.status_code == 200
    assert response.json() is None


def test_put_body_make_plan_returns_validation_error_when_profile_is_missing(client):
    # プロフィール未登録時はプラン作成で業務バリデーションエラーを返すことを確認する。
    response = client.put(
        "/body-make-plans",
        json={
            "course": "diet",
            "effective_from": "2026-04-06",
            "target_weight_kg": 5,
            "duration_days": 90,
            "memo": "夏までに絞る",
        },
    )

    assert response.status_code == 422
    assert response.json() == {
        "code": "BDMK-S-0001",
        "message": "PROFILE_REQUIRED",
    }


def test_put_body_make_plan_returns_validation_error_for_invalid_course(client):
    # course が不正な場合、独自エラーコード付きで 422 を返すことを確認する。
    _create_profile(client)

    response = client.put(
        "/body-make-plans",
        json={
            "course": "invalid",
            "effective_from": "2026-04-06",
            "target_weight_kg": 5,
            "duration_days": 90,
            "memo": "夏までに絞る",
        },
    )

    assert response.status_code == 422
    assert response.json() == {
        "code": "BDMK-V-0004",
        "message": "INVALID_GOAL_COURSE",
    }


def test_put_body_make_plan_creates_diet_plan(client):
    # 正常な入力でダイエットプランを新規作成できることを確認する。
    _create_profile(client)

    response = client.put(
        "/body-make-plans",
        json={
            "course": "diet",
            "effective_from": "2026-04-06",
            "target_weight_kg": 5,
            "duration_days": 90,
            "memo": "夏までに絞る",
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "user_id": 1,
        "course": "diet",
        "effective_from": "2026-04-06",
        "duration_days": 90,
        "target_end_date": "2026-07-04",
        "target_weight_kg": 5.0,
        "memo": "夏までに絞る",
        "start_weight_kg": 70.0,
        "maintenance_calories": 2636,
        "daily_calorie_adjustment": 400,
        "target_calories": 2236,
    }


def test_put_body_make_plan_allows_high_pace_diet_plan_when_target_calories_stay_above_basal_metabolism(client):
    # ペースが強めでも基礎代謝を下回らない場合は保存できることを確認する。
    _create_profile(
        client,
        height=180,
        weight=85,
        age=28,
        activity_level="active",
    )

    response = client.put(
        "/body-make-plans",
        json={
            "course": "diet",
            "effective_from": "2026-04-08",
            "target_weight_kg": 5,
            "duration_days": 30,
            "memo": "短期で絞る",
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "user_id": 1,
        "course": "diet",
        "effective_from": "2026-04-08",
        "duration_days": 30,
        "target_end_date": "2026-05-07",
        "target_weight_kg": 5.0,
        "memo": "短期で絞る",
        "start_weight_kg": 85.0,
        "maintenance_calories": 3356,
        "daily_calorie_adjustment": 1200,
        "target_calories": 2156,
    }


def test_put_body_make_plan_returns_validation_error_when_target_calories_fall_below_basal_metabolism(client):
    # 目標摂取カロリーが基礎代謝を下回る場合は保存できないことを確認する。
    _create_profile(
        client,
        height=165,
        weight=70,
        age=26,
        activity_level="moderate",
    )

    response = client.put(
        "/body-make-plans",
        json={
            "course": "diet",
            "effective_from": "2026-04-08",
            "target_weight_kg": 5,
            "duration_days": 15,
            "memo": "短期で絞る",
        },
    )

    assert response.status_code == 422
    assert response.json() == {
        "code": "BDMK-V-0005",
        "message": "TARGET_CALORIES_TOO_LOW",
    }


def test_get_latest_body_make_plan_returns_latest_plan(client):
    # 複数プラン登録時に最新プランを返すことを確認する。
    _create_profile(client)

    client.put(
        "/body-make-plans",
        json={
            "course": "maintenance",
            "effective_from": "2026-03-01",
            "target_weight_kg": 0,
            "duration_days": 0,
            "memo": "現状維持",
        },
    )
    client.put(
        "/body-make-plans",
        json={
            "course": "diet",
            "effective_from": "2026-04-01",
            "target_weight_kg": 5,
            "duration_days": 90,
            "memo": "夏までに絞る",
        },
    )

    response = client.get("/body-make-plans/latest")

    assert response.status_code == 200
    assert response.json() == {
        "id": 2,
        "user_id": 1,
        "course": "diet",
        "effective_from": "2026-04-01",
        "duration_days": 90,
        "target_end_date": "2026-06-29",
        "target_weight_kg": 5.0,
        "memo": "夏までに絞る",
        "start_weight_kg": 70.0,
        "maintenance_calories": 2636,
        "daily_calorie_adjustment": 400,
        "target_calories": 2236,
    }


def test_delete_body_make_plan_removes_upcoming_plan(client):
    # 予約済みの次回プランを削除できることを確認する。
    _create_profile(client)

    current_response = client.put(
        "/body-make-plans",
        json={
            "course": "diet",
            "effective_from": "2026-05-01",
            "target_weight_kg": 5,
            "duration_days": 90,
            "memo": "継続中",
        },
    )
    assert current_response.status_code == 200

    upcoming_response = client.put(
        "/body-make-plans",
        json={
            "course": "bulk",
            "effective_from": "2026-05-02",
            "target_weight_kg": 3,
            "duration_days": 90,
            "memo": "次は増量",
        },
    )
    assert upcoming_response.status_code == 200

    delete_response = client.delete("/body-make-plans/2")
    assert delete_response.status_code == 204

    response = client.get("/body-make-plans")

    assert response.status_code == 200
    assert [plan["id"] for plan in response.json()] == [1]
    assert response.json()[0]["course"] == "diet"


def test_delete_body_make_plan_returns_not_found_for_missing_plan(client):
    # 存在しないプランIDは 404 を返すことを確認する。
    response = client.delete("/body-make-plans/999")

    assert response.status_code == 404
    assert response.json() == {
        "code": "BDMK-S-0004",
        "message": "BODY_MAKE_PLAN_NOT_FOUND",
    }


def test_get_body_make_plans_returns_plans_in_descending_order(client):
    # 一覧取得で effective_from の降順にプランが返ることを確認する。
    _create_profile(client)

    client.put(
        "/body-make-plans",
        json={
            "course": "maintenance",
            "effective_from": "2026-03-01",
            "target_weight_kg": 0,
            "duration_days": 0,
            "memo": "現状維持",
        },
    )
    client.put(
        "/body-make-plans",
        json={
            "course": "diet",
            "effective_from": "2026-04-01",
            "target_weight_kg": 5,
            "duration_days": 90,
            "memo": "夏までに絞る",
        },
    )

    response = client.get("/body-make-plans")

    assert response.status_code == 200
    assert response.json() == [
        {
            "id": 2,
            "user_id": 1,
            "course": "diet",
            "effective_from": "2026-04-01",
            "duration_days": 90,
            "target_end_date": "2026-06-29",
            "target_weight_kg": 5.0,
            "memo": "夏までに絞る",
            "start_weight_kg": 70.0,
            "maintenance_calories": 2636,
            "daily_calorie_adjustment": 400,
            "target_calories": 2236,
        },
        {
            "id": 1,
            "user_id": 1,
            "course": "maintenance",
            "effective_from": "2026-03-01",
            "duration_days": 0,
            "target_end_date": "2026-03-01",
            "target_weight_kg": 0.0,
            "memo": "現状維持",
            "start_weight_kg": 70.0,
            "maintenance_calories": 2636,
            "daily_calorie_adjustment": 0,
            "target_calories": 2636,
        },
    ]


def test_put_body_make_plan_returns_validation_error_for_invalid_maintenance_target(client):
    # 維持コースで目標体重が 0 以外の場合は業務バリデーションエラーを返すことを確認する。
    _create_profile(client)

    response = client.put(
        "/body-make-plans",
        json={
            "course": "maintenance",
            "effective_from": "2026-04-06",
            "target_weight_kg": 1,
            "duration_days": 0,
            "memo": "維持のつもり",
        },
    )

    assert response.status_code == 422
    assert response.json() == {
        "code": "BDMK-V-0003",
        "message": "INVALID_TARGET_WEIGHT_KG",
    }


def test_put_body_make_plan_returns_validation_error_for_invalid_duration(client):
    # ダイエット・増量コースで期間 0 の場合は業務バリデーションエラーを返すことを確認する。
    _create_profile(client)

    response = client.put(
        "/body-make-plans",
        json={
            "course": "diet",
            "effective_from": "2026-04-06",
            "target_weight_kg": 5,
            "duration_days": 0,
            "memo": "短期集中",
        },
    )

    assert response.status_code == 422
    assert response.json() == {
        "code": "BDMK-V-0002",
        "message": "INVALID_DURATION_DAYS",
    }

def test_put_body_make_plan_allows_high_pace_bulk_plan(client):
    # 増量ペースが高めでも、backend では保存できることを確認する。
    _create_profile(client)

    response = client.put(
        "/body-make-plans",
        json={
            "course": "bulk",
            "effective_from": "2026-04-08",
            "target_weight_kg": 3,
            "duration_days": 30,
            "memo": "筋量アップ",
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "user_id": 1,
        "course": "bulk",
        "effective_from": "2026-04-08",
        "duration_days": 30,
        "target_end_date": "2026-05-07",
        "target_weight_kg": 3.0,
        "memo": "筋量アップ",
        "start_weight_kg": 70.0,
        "maintenance_calories": 2636,
        "daily_calorie_adjustment": 720,
        "target_calories": 3356,
    }
