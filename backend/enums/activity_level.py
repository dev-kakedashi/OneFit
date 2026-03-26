from enum import Enum


class ActivityLevel(str, Enum):
    SEDENTARY = "sedentary"  # ほとんど運動しない
    LIGHT = "light"  # 軽い運動(週1-3)
    MODERATE = "moderate"  # 中程度の運動(週3-5)
    ACTIVE = "active"  # 激しい運動
    VERY_ACTIVE = "very_active"  # 非常に激しい運動
