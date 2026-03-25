from fastapi import FastAPI

app = FastAPI(
    title="BodyMake App API",
    description="ボディメイク管理アプリのAPI",
    version="0.1.0",
)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}