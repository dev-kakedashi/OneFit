from unittest.mock import MagicMock, patch

import pytest
from db.session import get_db


def test_get_db_yields_session_and_closes_after_completion():
    # get_db が session を返し、利用後に close することを確認する。
    mock_db = MagicMock()

    with patch("db.session.SessionLocal", return_value=mock_db):
        generator = get_db()

        assert next(generator) is mock_db
        with pytest.raises(StopIteration):
            next(generator)

    mock_db.close.assert_called_once()


def test_get_db_closes_session_when_exception_is_thrown():
    # get_db 利用中に例外が発生しても close されることを確認する。
    mock_db = MagicMock()

    with patch("db.session.SessionLocal", return_value=mock_db):
        generator = get_db()
        next(generator)

        with pytest.raises(RuntimeError):
            generator.throw(RuntimeError("boom"))

    mock_db.close.assert_called_once()
