def test_get_meal_logs_returns_validation_error_for_invalid_date(client):
    # date の形式が不正な場合、独自エラーコード付きで 422 を返すことを確認する。
    response = client.get("/meal-logs", params={"date": "invalid-date"})

    assert response.status_code == 422
    assert response.json() == {
        "code": "MEAL-A-0001",
        "message": "INVALID_DATE",
    }


def test_post_meal_log_returns_validation_error_for_blank_meal_name(client):
    # meal_name が空の場合、独自エラーコード付きで 422 を返すことを確認する。
    payload = {
        "meal_name": "   ",
        "calories": 500,
        "eaten_at": "2026-03-27T08:00:00",
        "memo": "Eggs",
    }

    response = client.post("/meal-logs", json=payload)

    assert response.status_code == 422
    assert response.json() == {
        "code": "MEAL-V-0001",
        "message": "INVALID_MEAL_NAME",
    }


def test_put_meal_log_returns_validation_error_for_invalid_id(client):
    # meal_id が不正な場合、独自エラーコード付きで 422 を返すことを確認する。
    payload = {
        "meal_name": "Lunch",
        "calories": 700,
        "eaten_at": "2026-03-27T12:00:00",
        "memo": "Rice bowl",
    }

    response = client.put("/meal-logs/0", json=payload)

    assert response.status_code == 422
    assert response.json() == {
        "code": "MEAL-A-0002",
        "message": "INVALID_ID",
    }


def test_put_meal_log_returns_not_found_when_target_does_not_exist(client):
    # 更新対象が存在しない場合、独自エラーコード付きで 404 を返すことを確認する。
    payload = {
        "meal_name": "Lunch",
        "calories": 700,
        "eaten_at": "2026-03-27T12:00:00",
        "memo": "Rice bowl",
    }

    response = client.put("/meal-logs/1", json=payload)

    assert response.status_code == 404
    assert response.json() == {
        "code": "MEAL-S-0003",
        "message": "MEAL_NOT_FOUND",
    }


def test_delete_meal_log_returns_not_found_when_target_does_not_exist(client):
    # 削除対象が存在しない場合、独自エラーコード付きで 404 を返すことを確認する。
    response = client.delete("/meal-logs/1")

    assert response.status_code == 404
    assert response.json() == {
        "code": "MEAL-S-0005",
        "message": "MEAL_NOT_FOUND",
    }
