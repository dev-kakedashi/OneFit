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

## DB の作り直し

データをすべて削除して初期状態からやり直す場合は、以下を実行してください。
```
docker compose down -v
docker compose up -d db
docker compose run --rm backend alembic -c db/alembic.ini upgrade head
docker compose up -d backend
```

## モデル変更後に migration を追加する場合

スキーマ変更を行った場合のみ、新しい migration を作成します。
```
docker compose run --rm backend alembic -c db/alembic.ini revision --autogenerate -m "describe your change"
docker compose run --rm backend alembic -c db/alembic.ini upgrade head
```