from datetime import datetime

from pydantic import BaseModel, Field


class WaterLogCreateRequest(BaseModel):
    amount_ml: int = Field(..., gt=0)
    drank_at: datetime
    memo: str | None = None


class WaterLogUpdateRequest(BaseModel):
    amount_ml: int = Field(..., gt=0)
    drank_at: datetime
    memo: str | None = None
