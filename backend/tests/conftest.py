import sys
from pathlib import Path

# テスト実行時に backend 配下のモジュールを import できるようにする。
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.append(str(BACKEND_DIR))

import pytest
from application.main import app
from db.base import Base
from db.session import get_db
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# テストごとに独立した軽量 DB を使えるよう、インメモリ SQLite を用意する。
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


@pytest.fixture()
def client():
    # テスト開始時にテーブルを作成し、FastAPI の DB 依存をテスト用 DB に差し替える。
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    # 通常の API テスト用クライアント。
    with TestClient(app) as test_client:
        yield test_client

    # テスト終了後に依存差し替えを解除し、テーブルを破棄する。
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client_no_raise():
    # 500 エラーのレスポンス内容を検証するため、例外を再送出しないクライアントを使う。
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app, raise_server_exceptions=False) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session():
    # repository テスト用に、直接 DB セッションを利用できる fixture を提供する。
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
