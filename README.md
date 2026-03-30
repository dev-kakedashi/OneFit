# OneFit

## アプリ概要

OneFit は、食事・トレーニング・身体情報を管理し、日々のカロリー収支を可視化するボディメイク管理アプリです。

主な機能は以下です。

* 身体情報の登録
* 食事記録の登録
* トレーニング記録の登録
* 1日のカロリー収支の算出
* ダッシュボードでの状態確認

## 開発方針

frontend / backend ともに Docker 上で動かす前提です。  
ローカル環境の Node.js や Python のバージョン差分には依存せず、確認作業も原則 `docker compose exec` または `docker compose run` で行います。

## 初回起動

1. 環境変数ファイルを作成
   ```bash
   cp .env.example .env
   ```
2. Docker イメージをビルド
    ```bash
    docker compose build
    ```
3. DB を起動
    ```bash
    docker compose up -d db
    ```
4. マイグレーションを適用
    ```bash
    docker compose run --rm backend alembic -c db/alembic.ini upgrade head
    ```
5. frontend / backend を起動
    ```bash
    docker compose up -d frontend backend
    ```

## 初回起動後

起動:
```bash
docker compose up -d
```

停止:
```bash
docker compose down
```

## frontend の確認コマンド

frontend コンテナが起動中の場合:
```bash
docker compose exec frontend npm run typecheck
docker compose exec frontend npm run build
```

frontend コンテナが起動していない場合:
```bash
docker compose run --rm frontend npm run typecheck
docker compose run --rm frontend npm run build
```

## 動作確認

* frontend
    * http://localhost:5173
* backend ヘルスチェック
    * curl http://localhost:8000/health
        * レスポンス: {"status": "ok"}
        * ※ /health は DB 接続確認まではしていないため、アプリが起動しているかの確認用です。
* Swagger
    * http://localhost:8000/docs

## frontend の依存関係を更新した場合

frontend の依存関係を追加・更新した場合は、匿名 volume に古い node_modules が残ることがあるため、frontend を再作成してください。
```bash
docker compose up --build --renew-anon-volumes frontend
```

## DB の作り直し

データをすべて削除して初期状態からやり直す場合は、以下を実行してください。
```bash
docker compose down -v
docker compose up -d db
docker compose run --rm backend alembic -c db/alembic.ini upgrade head
docker compose up -d frontend backend
```

## 環境変数

.env.example をもとに .env を作成してください。

主な環境変数:

* DB_HOST
* DB_PORT
* DB_NAME
* DB_USER
* DB_PASSWORD
* MYSQL_ROOT_PASSWORD
* MYSQL_DATABASE
* MYSQL_USER
* MYSQL_PASSWORD
* TZ
* FRONTEND_ORIGINS

## モデル変更後に migration を追加する場合

スキーマ変更を行った場合のみ、新しい migration を作成します。
```bash
docker compose run --rm backend alembic -c db/alembic.ini revision --autogenerate -m "describe your change"
docker compose run --rm backend alembic -c db/alembic.ini upgrade head
```

## コミットルール

|type|説明|
|-|-|
|feat|新機能追加|
|fix|バグ修正|
|docs|ドキュメント修正・追加|
|style|コードの意味が変わらない修正（フォーマット、セミコロンなど）|
|refactor|リファクタリング（機能変更なし）|
|perf|パフォーマンス改善|
|test|テスト関連|
|chore|ビルド/CI/依存関係などの環境系|