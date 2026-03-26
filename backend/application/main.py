from application.api.routes.meal_routes import router as meal_router
from application.api.routes.user_routes import router as user_router
from fastapi import FastAPI

app = FastAPI(
    title="BodyMake App API",
    description="ボディメイク管理アプリのAPI",
    version="0.1.0",
)

app.include_router(user_router)
app.include_router(meal_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
