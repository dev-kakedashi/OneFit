import os

from application.api.routes.dashboard_routes import router as dashboard_router
from application.api.routes.meal_routes import router as meal_router
from application.api.routes.user_routes import router as user_router
from application.api.routes.water_routes import router as water_router
from application.api.routes.workout_routes import router as workout_router
from application.api.routes.body_make_plan_routes import router as body_make_plan_router
from application.api.validation_error_map import VALIDATION_ERROR_MAP
from common.errors.errors import CommonErrors
from common.errors.exceptions import (
    NotFoundException,
    RepositoryException,
    ServiceException,
    ValidationException,
)
from common.logger import AppLogger
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from schemas.response.error_response import ErrorResponse

app = FastAPI(
    title="BodyMake App API",
    description="ボディメイク管理アプリのAPI",
    version="0.1.0",
)

frontend_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        ",".join(
            [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
            ]
        ),
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = AppLogger()


def _route_path(request: Request) -> str:
    route = request.scope.get("route")
    if route is not None and hasattr(route, "path"):
        return route.path
    return request.url.path


def _first_field_name(exc: RequestValidationError) -> str | None:
    if not exc.errors():
        return None

    loc = exc.errors()[0].get("loc", ())
    if len(loc) < 2:
        return None

    return str(loc[1])


@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    error_def = VALIDATION_ERROR_MAP.get(
        (request.method, _route_path(request), _first_field_name(exc)),
        CommonErrors.INVALID_REQUEST,
    )

    logger.warning(
        error_def.code,
        error_def.message,
        method=request.method,
        path=request.url.path,
        field=_first_field_name(exc),
    )

    return JSONResponse(
        status_code=422,
        content=ErrorResponse(
            code=error_def.code,
            message=error_def.message,
        ).model_dump(),
    )


@app.exception_handler(ValidationException)
async def validation_exception_handler(
    request: Request,
    exc: ValidationException,
) -> JSONResponse:
    logger.warning(
        exc.code,
        exc.message,
        method=request.method,
        path=request.url.path,
    )
    return JSONResponse(
        status_code=422,
        content=ErrorResponse(code=exc.code, message=exc.message).model_dump(),
    )


@app.exception_handler(NotFoundException)
async def not_found_exception_handler(
    request: Request,
    exc: NotFoundException,
) -> JSONResponse:
    logger.warning(
        exc.code,
        exc.message,
        method=request.method,
        path=request.url.path,
    )
    return JSONResponse(
        status_code=404,
        content=ErrorResponse(code=exc.code, message=exc.message).model_dump(),
    )


@app.exception_handler(ServiceException)
@app.exception_handler(RepositoryException)
async def app_exception_handler(
    request: Request,
    exc: ServiceException | RepositoryException,
) -> JSONResponse:
    logger.error(
        exc.code,
        exc.message,
        error=exc.error,
        method=request.method,
        path=request.url.path,
    )
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(code=exc.code, message=exc.message).model_dump(),
    )


@app.exception_handler(Exception)
async def unexpected_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    logger.error(
        CommonErrors.INTERNAL_SERVER_ERROR.code,
        CommonErrors.INTERNAL_SERVER_ERROR.message,
        error=exc,
        method=request.method,
        path=request.url.path,
    )
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            code=CommonErrors.INTERNAL_SERVER_ERROR.code,
            message=CommonErrors.INTERNAL_SERVER_ERROR.message,
        ).model_dump(),
    )


app.include_router(user_router)
app.include_router(meal_router)
app.include_router(workout_router)
app.include_router(water_router)
app.include_router(dashboard_router)
app.include_router(body_make_plan_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
