from enums.activity_level import ActivityLevel
from enums.gender import Gender
from pydantic import BaseModel, Field


class UserUpsertRequest(BaseModel):
    height: float = Field(..., gt=0)
    weight: float = Field(..., gt=0)
    age: int = Field(..., gt=0)
    gender: Gender
    activity_level: ActivityLevel
