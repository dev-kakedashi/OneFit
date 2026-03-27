from domain.user.calculators import (
    calculate_basal_metabolism,
    calculate_required_calories,
)
from enums.activity_level import ActivityLevel
from enums.gender import Gender


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
