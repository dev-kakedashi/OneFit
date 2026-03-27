def test_get_workout_logs_returns_validation_error_for_invalid_date(client):
    # date の形式が不正な場合、独自エラーコード付きで 422 を返すことを確認する。
    response = client.get("/workout-logs", params={"date": "invalid-date"})

    assert response.status_code == 422
    assert response.json() == {
        "code": "WORK-A-0001",
        "message": "INVALID_DATE",
    }


def test_post_workout_log_returns_validation_error_for_blank_workout_name(client):
    # workout_name が空の場合、独自エラーコード付きで 422 を返すことを確認する。
    payload = {
        "workout_name": "   ",
        "burned_calories": 300,
        "worked_out_at": "2026-03-27T19:00:00",
        "memo": "30 min",
    }

    response = client.post("/workout-logs", json=payload)

    assert response.status_code == 422
    assert response.json() == {
        "code": "WORK-V-0001",
        "message": "INVALID_WORKOUT_NAME",
    }


def test_put_workout_log_returns_validation_error_for_invalid_id(client):
    # workout_id が不正な場合、独自エラーコード付きで 422 を返すことを確認する。
    payload = {
        "workout_name": "Running",
        "burned_calories": 300,
        "worked_out_at": "2026-03-27T19:00:00",
        "memo": "30 min",
    }

    response = client.put("/workout-logs/0", json=payload)

    assert response.status_code == 422
    assert response.json() == {
        "code": "WORK-A-0002",
        "message": "INVALID_ID",
    }


def test_put_workout_log_returns_not_found_when_target_does_not_exist(client):
    # 更新対象が存在しない場合、独自エラーコード付きで 404 を返すことを確認する。
    payload = {
        "workout_name": "Running",
        "burned_calories": 300,
        "worked_out_at": "2026-03-27T19:00:00",
        "memo": "30 min",
    }

    response = client.put("/workout-logs/1", json=payload)

    assert response.status_code == 404
    assert response.json() == {
        "code": "WORK-S-0003",
        "message": "WORKOUT_NOT_FOUND",
    }


def test_delete_workout_log_returns_not_found_when_target_does_not_exist(client):
    # 削除対象が存在しない場合、独自エラーコード付きで 404 を返すことを確認する。
    response = client.delete("/workout-logs/1")

    assert response.status_code == 404
    assert response.json() == {
        "code": "WORK-S-0005",
        "message": "WORKOUT_NOT_FOUND",
    }
