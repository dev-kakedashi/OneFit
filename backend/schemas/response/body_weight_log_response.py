from datetime import date

from pydantic import BaseModel, ConfigDict


class BodyWeightLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    measured_on: date
    weight_kg: float
    memo: str | None = None
