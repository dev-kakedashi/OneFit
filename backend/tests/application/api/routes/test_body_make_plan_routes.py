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
