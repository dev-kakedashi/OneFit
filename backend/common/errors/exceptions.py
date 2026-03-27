from common.errors.errors import ErrorDefinition


class AppException(Exception):
    """アプリ共通例外。"""

    def __init__(self, error_def: ErrorDefinition, *, error: Exception | None = None):
        super().__init__(error_def.message)
        self.code = error_def.code
        self.message = error_def.message
        self.error = error


class ValidationException(AppException):
    """入力値や業務バリデーションエラー。"""


class NotFoundException(AppException):
    """対象データ未存在エラー。"""


class ServiceException(AppException):
    """サービス層エラー。"""


class RepositoryException(AppException):
    """リポジトリ層エラー。"""
