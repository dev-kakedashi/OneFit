from enum import Enum


class GoalCourse(str, Enum):
    MAINTENANCE = "maintenance"
    DIET = "diet"
    BULK = "bulk"
