from datetime import date

from pydantic import BaseModel, Field


class BodyWeightLogUpsertRequest(BaseModel):
    measured_on: date
    weight_kg: float = Field(..., ge=20, le=300)
    memo: str | None = None
