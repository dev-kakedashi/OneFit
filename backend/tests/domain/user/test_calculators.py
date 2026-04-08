from datetime import date

from domain.user.calculators import (
    calculate_basal_metabolism,
    calculate_daily_calorie_adjustment,
    calculate_required_calories,
    calculate_target_calories_for_plan,
    calculate_target_end_date,
)
from enums.activity_level import ActivityLevel
from enums.gender import Gender
from enums.goal_course import GoalCourse


def test_calculate_basal_metabolism_for_male():
    # 男性の基礎代謝が仕様どおりに計算されることを確認する。
    result = calculate_basal_metabolism(
        gender=Gender.MALE,
        weight=70,
        height=175,
        age=30,
    )
    assert result == 1701


def test_calculate_required_calories():
    # 活動レベル係数を反映した必須カロリーが計算されることを確認する。
    result = calculate_required_calories(
        basal_metabolism=1701,
        activity_level=ActivityLevel.MODERATE,
    )
    assert result == 2636


def test_calculate_basal_metabolism_for_other():
    # other は男性式と女性式の平均値で計算されることを確認する。
    result = calculate_basal_metabolism(
        gender=Gender.OTHER,
        weight=70,
        height=175,
        age=30,
    )
    assert result == 1604


def test_calculate_target_end_date_returns_same_day_for_zero_duration():
    # 維持コースなどで期間が 0 日の場合は開始日をそのまま終了日にすることを確認する。
    result = calculate_target_end_date(
        effective_from=date(2026, 4, 6),
        duration_days=0,
    )
    assert result == date(2026, 4, 6)


def test_calculate_target_end_date_includes_start_date():
    # 開始日を 1 日目として終了日が計算されることを確認する。
    result = calculate_target_end_date(
        effective_from=date(2026, 4, 6),
        duration_days=90,
    )
    assert result == date(2026, 7, 4)


def test_calculate_daily_calorie_adjustment_for_five_kg_in_ninety_days():
    # 5kg を 90 日で目指す場合、1 日あたり 400kcal の調整になることを確認する。
    result = calculate_daily_calorie_adjustment(
        target_weight_kg=5,
        duration_days=90,
    )
    assert result == 400


def test_calculate_target_calories_for_maintenance_plan():
    # 維持コースでは調整量 0、目標カロリーは維持カロリーと一致することを確認する。
    daily_adjustment, target_calories = calculate_target_calories_for_plan(
        maintenance_calories=2386,
        course=GoalCourse.MAINTENANCE,
        target_weight_kg=0,
        duration_days=0,
    )

    assert daily_adjustment == 0
    assert target_calories == 2386


def test_calculate_target_calories_for_diet_plan():
    # ダイエットコースでは維持カロリーから調整量が差し引かれることを確認する。
    daily_adjustment, target_calories = calculate_target_calories_for_plan(
        maintenance_calories=2386,
        course=GoalCourse.DIET,
        target_weight_kg=5,
        duration_days=90,
    )

    assert daily_adjustment == 400
    assert target_calories == 1986


def test_calculate_target_calories_for_bulk_plan():
    # 増量コースでは維持カロリーへ調整量が加算されることを確認する。
    daily_adjustment, target_calories = calculate_target_calories_for_plan(
        maintenance_calories=2386,
        course=GoalCourse.BULK,
        target_weight_kg=5,
        duration_days=90,
    )

    assert daily_adjustment == 400
    assert target_calories == 2786
