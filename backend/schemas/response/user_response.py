from enums.activity_level import ActivityLevel
from enums.gender import Gender
from pydantic import BaseModel


class UserResponse(BaseModel):
    id: int
    height: float
    weight: float
    age: int
    gender: Gender
    activity_level: ActivityLevel

    class Config:
        from_attributes = True
