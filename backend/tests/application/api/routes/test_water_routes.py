from datetime import datetime

from models.water_log import WaterLog


def test_get_water_logs_returns_records_for_date(client, db_session):
    # 指定日の水分記録一覧を時刻昇順で返すことを確認する。
    db_session.add_all(
        [
            WaterLog(
                id=1,
                amount_ml=300,
                drank_at=datetime(2026, 3, 27, 8, 0, 0),
                memo="Water",
            ),
            WaterLog(
                id=2,
                amount_ml=500,
                drank_at=datetime(2026, 3, 27, 13, 0, 0),
                memo="Tea",
            ),
            WaterLog(
                id=3,
                amount_ml=200,
                drank_at=datetime(2026, 3, 28, 9, 0, 0),
                memo="Other day",
            ),
        ]
    )
    db_session.commit()

    response = client.get("/water-logs", params={"date": "2026-03-27"})

    assert response.status_code == 200
    assert response.json() == [
        {
            "id": 1,
            "amount_ml": 300,
            "drank_at": "2026-03-27T08:00:00",
            "memo": "Water",
        },
        {
            "id": 2,
            "amount_ml": 500,
            "drank_at": "2026-03-27T13:00:00",
            "memo": "Tea",
        },
    ]


def test_post_water_log_creates_record(client):
    # 正常な入力で水分記録を登録できることを確認する。
    payload = {
        "amount_ml": 300,
        "drank_at": "2026-03-27T08:00:00",
        "memo": "Water",
    }

    response = client.post("/water-logs", json=payload)

    assert response.status_code == 201
    assert response.json() == {
        "id": 1,
        "amount_ml": 300,
        "drank_at": "2026-03-27T08:00:00",
        "memo": "Water",
    }


def test_put_water_log_updates_existing_record(client, db_session):
    # 既存の水分記録を更新できることを確認する。
    db_session.add(
        WaterLog(
            id=1,
            amount_ml=300,
            drank_at=datetime(2026, 3, 27, 8, 0, 0),
            memo="Water",
        )
    )
    db_session.commit()

    payload = {
        "amount_ml": 500,
        "drank_at": "2026-03-27T12:00:00",
        "memo": "Tea",
    }

    response = client.put("/water-logs/1", json=payload)

    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "amount_ml": 500,
        "drank_at": "2026-03-27T12:00:00",
        "memo": "Tea",
    }


def test_delete_water_log_deletes_existing_record(client, db_session):
    # 既存の水分記録を削除できることを確認する。
    db_session.add(
        WaterLog(
            id=1,
            amount_ml=300,
            drank_at=datetime(2026, 3, 27, 8, 0, 0),
            memo="Water",
        )
    )
    db_session.commit()

    response = client.delete("/water-logs/1")

    assert response.status_code == 204
    assert response.content == b""
    assert db_session.query(WaterLog).filter(WaterLog.id == 1).first() is None


def test_get_water_logs_returns_validation_error_for_invalid_date(client):
    # date の形式が不正な場合、独自エラーコード付きで 422 を返すことを確認する。
    response = client.get("/water-logs", params={"date": "invalid-date"})

    assert response.status_code == 422
    assert response.json() == {
        "code": "WATR-A-0001",
        "message": "INVALID_DATE",
    }


def test_post_water_log_returns_validation_error_for_invalid_amount_ml(client):
    # amount_ml が不正な場合、独自エラーコード付きで 422 を返すことを確認する。
    payload = {
        "amount_ml": 0,
        "drank_at": "2026-03-27T08:00:00",
        "memo": "Water",
    }

    response = client.post("/water-logs", json=payload)

    assert response.status_code == 422
    assert response.json() == {
        "code": "WATR-V-0001",
        "message": "INVALID_AMOUNT_ML",
    }


def test_put_water_log_returns_validation_error_for_invalid_id(client):
    # water_log_id が不正な場合、独自エラーコード付きで 422 を返すことを確認する。
    payload = {
        "amount_ml": 300,
        "drank_at": "2026-03-27T08:00:00",
        "memo": "Water",
    }

    response = client.put("/water-logs/0", json=payload)

    assert response.status_code == 422
    assert response.json() == {
        "code": "WATR-A-0002",
        "message": "INVALID_ID",
    }


def test_put_water_log_returns_not_found_when_target_does_not_exist(client):
    # 更新対象が存在しない場合、独自エラーコード付きで 404 を返すことを確認する。
    payload = {
        "amount_ml": 300,
        "drank_at": "2026-03-27T08:00:00",
        "memo": "Water",
    }

    response = client.put("/water-logs/1", json=payload)

    assert response.status_code == 404
    assert response.json() == {
        "code": "WATR-S-0003",
        "message": "WATER_LOG_NOT_FOUND",
    }


def test_delete_water_log_returns_not_found_when_target_does_not_exist(client):
    # 削除対象が存在しない場合、独自エラーコード付きで 404 を返すことを確認する。
    response = client.delete("/water-logs/1")

    assert response.status_code == 404
    assert response.json() == {
        "code": "WATR-S-0005",
        "message": "WATER_LOG_NOT_FOUND",
    }
