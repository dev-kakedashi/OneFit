from enums.activity_level import ActivityLevel
from enums.gender import Gender
from pydantic import BaseModel, ConfigDict


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    height: float
    weight: float
    age: int
    gender: Gender
    activity_level: ActivityLevel
    daily_water_goal_ml: int | None = None
