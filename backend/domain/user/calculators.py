from datetime import date, timedelta
from math import ceil, floor

from enums.activity_level import ActivityLevel
from enums.gender import Gender
from enums.goal_course import GoalCourse

_ACTIVITY_MULTIPLIERS = {
    ActivityLevel.SEDENTARY: 1.2,
    ActivityLevel.LIGHT: 1.375,
    ActivityLevel.MODERATE: 1.55,
    ActivityLevel.ACTIVE: 1.725,
    ActivityLevel.VERY_ACTIVE: 1.9,
}

_KCAL_PER_KG = 7200


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


def calculate_target_end_date(
    effective_from: date,
    duration_days: int,
) -> date:
    """開始日と日数から終了日を計算する。

    開始日を 1 日目として扱う。

    Args:
        effective_from: 計画開始日。
        duration_days: 計画日数。

    Returns:
        計画終了日。
    """
    if duration_days <= 0:
        return effective_from

    return effective_from + timedelta(days=duration_days - 1)


def calculate_daily_calorie_adjustment(
    target_weight_kg: float,
    duration_days: int,
) -> int:
    """体重目標を達成するための1日あたり調整量を計算する。

    Args:
        target_weight_kg: 目標体重変化量。UI上は常に正の値。
        duration_days: 計画日数。

    Returns:
        1日あたりのカロリー調整量。
    """
    if target_weight_kg <= 0 or duration_days <= 0:
        return 0

    total_calorie_delta = target_weight_kg * _KCAL_PER_KG
    return ceil(total_calorie_delta / duration_days)


def calculate_target_calories_for_plan(
    maintenance_calories: int,
    course: GoalCourse,
    target_weight_kg: float,
    duration_days: int,
) -> tuple[int, int]:
    """コースと目標条件から目標カロリーを計算する。

    Args:
        maintenance_calories: 維持カロリー。
        course: 選択コース。
        target_weight_kg: 目標増減量。UI上は常に正の値。
        duration_days: 計画日数。

    Returns:
        ``(daily_calorie_adjustment, target_calories)`` のタプル。
    """
    if course == GoalCourse.MAINTENANCE:
        return 0, maintenance_calories

    daily_adjustment = calculate_daily_calorie_adjustment(
        target_weight_kg=target_weight_kg,
        duration_days=duration_days,
    )

    if course == GoalCourse.DIET:
        return daily_adjustment, maintenance_calories - daily_adjustment

    return daily_adjustment, maintenance_calories + daily_adjustment
