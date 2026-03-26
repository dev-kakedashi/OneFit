# OneFit

## アプリ概要

本アプリは、食事・トレーニング・身体情報を管理し、日々のカロリー収支を可視化することで理想の体づくりをサポートするボディメイク管理アプリです。

本アプリでは以下を管理できます。

* 身体情報の登録
* 食事記録の登録
* トレーニング記録の登録
* 1日のカロリー収支の算出
* ダッシュボードでの状態確認

## backend 実装の初回起動

1. Docker イメージをビルド
    docker compose build backend
2. DB を起動
    docker compose up -d db
3. マイグレーションを適用
    docker compose run --rm backend alembic -c db/alembic.ini upgrade head
4. バックエンドを起動
    docker compose up -d backend

## 動作確認

* ヘルスチェック
    curl http://localhost:8000/health
* Swagger
    http://localhost:8000/docs