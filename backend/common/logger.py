import json
import logging
import sys
import traceback
from datetime import datetime
from typing import Any


class AppLogger:
    """アプリ共通で利用する JSON ロガー。"""

    def __init__(self, logger_name: str = "app"):
        self.logger = logging.getLogger(logger_name)
        self.logger.setLevel(logging.INFO)
        self.logger.propagate = False

        if not self.logger.handlers:
            handler = logging.StreamHandler(sys.stdout)
            handler.setFormatter(logging.Formatter("%(message)s"))
            self.logger.addHandler(handler)

    def _write(
        self,
        level: int,
        log_code: str,
        message: str,
        error: Exception | None = None,
        **extra: Any,
    ) -> None:
        """共通フォーマットでログを出力する。"""

        log_data = {
            "timestamp": datetime.now().astimezone().isoformat(),
            "level": logging.getLevelName(level),
            "log_code": log_code,
            "message": message,
            **extra,
        }

        if error is not None and error.__traceback__ is not None:
            log_data["traceback"] = "".join(
                traceback.format_exception(type(error), error, error.__traceback__)
            )

        self.logger.log(level, json.dumps(log_data, ensure_ascii=False))

    def info(self, log_code: str, message: str, **extra: Any) -> None:
        self._write(logging.INFO, log_code, message, **extra)

    def warning(self, log_code: str, message: str, **extra: Any) -> None:
        self._write(logging.WARNING, log_code, message, **extra)

    def error(
        self,
        log_code: str,
        message: str,
        error: Exception | None = None,
        **extra: Any,
    ) -> None:
        self._write(logging.ERROR, log_code, message, error=error, **extra)
