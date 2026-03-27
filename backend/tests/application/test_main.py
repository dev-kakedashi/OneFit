def test_health_check_returns_ok(client):
    # アプリが起動しており、ヘルスチェック API が正常応答することを確認する。
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
