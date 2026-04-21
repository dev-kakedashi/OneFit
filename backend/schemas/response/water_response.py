from datetime import datetime

from pydantic import BaseModel, ConfigDict


class WaterLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    amount_ml: int
    drank_at: datetime
    memo: str | None = None
