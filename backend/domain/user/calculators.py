from math import floor

from enums.activity_level import ActivityLevel
from enums.gender import Gender

_ACTIVITY_MULTIPLIERS = {
    ActivityLevel.SEDENTARY: 1.2,
    ActivityLevel.LIGHT: 1.375,
    ActivityLevel.MODERATE: 1.55,
    ActivityLevel.ACTIVE: 1.725,
    ActivityLevel.VERY_ACTIVE: 1.9,
}


def calculate_basal_metabolism(
    gender: Gender,
    weight: float,
    height: float,
    age: int,
) -> int:
    """Harris-Benedict 方程式に基づいて基礎代謝量を計算する。

    Args:
        gender: 性別。
        weight: 体重kg。
        height: 身長cm。
        age: 年齢。

    Returns:
        小数点以下を切り捨てた基礎代謝量。
    """
    male_value = 66.47 + (13.75 * weight) + (5.003 * height) - (6.755 * age)
    female_value = 655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age)

    if gender == Gender.MALE:
        value = male_value
    elif gender == Gender.FEMALE:
        value = female_value
    else:
        value = (male_value + female_value) / 2

    return floor(value)


def calculate_required_calories(
    basal_metabolism: int,
    activity_level: ActivityLevel,
) -> int:
    """活動レベルを加味した必要カロリーを計算する。

    Args:
        basal_metabolism: 基礎代謝量。
        activity_level: 活動レベル。

    Returns:
        小数点以下を切り捨てた必要カロリー。
    """
    multiplier = _ACTIVITY_MULTIPLIERS[activity_level]
    return floor(basal_metabolism * multiplier)
