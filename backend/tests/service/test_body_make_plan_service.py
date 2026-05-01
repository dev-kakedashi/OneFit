from datetime import date
from unittest.mock import patch

import pytest
from common.errors.errors import BodyMakeErrors
from common.errors.exceptions import RepositoryException, ValidationException
from enums.activity_level import ActivityLevel
from enums.gender import Gender
from enums.goal_course import GoalCourse
from models.body_make_plan import BodyMakePlan
from models.user import User
from schemas.request.body_make_plan_request import BodyMakePlanUpsertRequest
from service.body_make_plan_service import BodyMakePlanService
from sqlalchemy.exc import SQLAlchemyError


def _user(**overrides) -> User:
    data = {
        "id": 1,
        "height": 175,
        "weight": 70,
        "age": 30,
        "gender": Gender.MALE,
        "activity_level": ActivityLevel.MODERATE,
        "basal_metabolism": 1701,
        "required_calories": 2386,
        "daily_water_goal_ml": 2000,
    }
    data.update(overrides)
    return User(**data)


def test_get_latest_plan_returns_none_when_profile_not_registered():
    # プロフィール未登録時は最新プラン取得で None を返すことを確認する。
    with patch("service.body_make_plan_service.UserRepository.get_first", return_value=None):
        result = BodyMakePlanService.get_latest_plan(object())

    assert result is None


def test_get_latest_plan_returns_latest_registered_plan():
    # 最新プランが存在する場合、その内容を response として返すことを確認する。
    plan = BodyMakePlan(
        id=1,
        user_id=1,
        course=GoalCourse.DIET,
        effective_from=date(2026, 4, 6),
        duration_days=90,
        target_end_date=date(2026, 7, 4),
        target_weight_kg=5,
        memo="夏までに絞る",
        start_weight_kg=70,
        maintenance_calories=2386,
        daily_calorie_adjustment=400,
        target_calories=1986,
    )

    with (
        patch("service.body_make_plan_service.UserRepository.get_first", return_value=_user()),
        patch(
            "service.body_make_plan_service.BodyMakePlanRepository.find_latest_by_user",
            return_value=plan,
        ),
    ):
        result = BodyMakePlanService.get_latest_plan(object())

    assert result is not None
    assert result.id == 1
    assert result.course == GoalCourse.DIET
    assert result.target_calories == 1986
    assert result.daily_calorie_adjustment == 400


def test_list_plans_returns_registered_plans():
    # プラン一覧取得で登録済みプラン一覧をそのまま返すことを確認する。
    plans = [
        BodyMakePlan(
            id=2,
            user_id=1,
            course=GoalCourse.BULK,
            effective_from=date(2026, 5, 1),
            duration_days=60,
            target_end_date=date(2026, 6, 29),
            target_weight_kg=5,
            memo="筋量アップ",
            start_weight_kg=70,
            maintenance_calories=2386,
            daily_calorie_adjustment=600,
            target_calories=2986,
        ),
        BodyMakePlan(
            id=1,
            user_id=1,
            course=GoalCourse.MAINTENANCE,
            effective_from=date(2026, 4, 6),
            duration_days=0,
            target_end_date=date(2026, 4, 6),
            target_weight_kg=0,
            memo="現状維持",
            start_weight_kg=70,
            maintenance_calories=2386,
            daily_calorie_adjustment=0,
            target_calories=2386,
        ),
    ]

    with (
        patch("service.body_make_plan_service.UserRepository.get_first", return_value=_user()),
        patch(
            "service.body_make_plan_service.BodyMakePlanRepository.find_all_by_user",
            return_value=plans,
        ),
    ):
        result = BodyMakePlanService.list_plans(object())

    assert len(result) == 2
    assert result[0].course == GoalCourse.BULK
    assert result[1].course == GoalCourse.MAINTENANCE


def test_delete_plan_returns_true_when_plan_exists():
    # 対象プランが存在する場合は削除できることを確認する。
    plan = BodyMakePlan(
        id=1,
        user_id=1,
        course=GoalCourse.DIET,
        effective_from=date(2026, 4, 6),
        duration_days=90,
        target_end_date=date(2026, 7, 4),
        target_weight_kg=5,
        memo="夏までに絞る",
        start_weight_kg=70,
        maintenance_calories=2386,
        daily_calorie_adjustment=400,
        target_calories=1986,
    )

    db = object()

    with (
        patch(
            "service.body_make_plan_service.BodyMakePlanRepository.find_by_id",
            return_value=plan,
        ),
        patch("service.body_make_plan_service.BodyMakePlanRepository.delete") as mock_delete,
    ):
        result = BodyMakePlanService.delete_plan(db, 1)

    mock_delete.assert_called_once_with(db, plan)
    assert result is True


def test_delete_plan_returns_false_when_plan_is_missing():
    # 対象プランが存在しない場合は False を返すことを確認する。
    with patch(
        "service.body_make_plan_service.BodyMakePlanRepository.find_by_id",
        return_value=None,
    ):
        result = BodyMakePlanService.delete_plan(object(), 1)

    assert result is False


def test_upsert_plan_creates_plan_with_calculated_values():
    # 新規作成時に目標終了日、調整量、目標カロリーが計算されて保存されることを確認する。
    request = BodyMakePlanUpsertRequest(
        course=GoalCourse.DIET,
        effective_from=date(2026, 4, 6),
        target_weight_kg=5,
        duration_days=90,
        memo="夏までに絞る",
    )
    saved_plan = BodyMakePlan(
        id=1,
        user_id=1,
        course=GoalCourse.DIET,
        effective_from=date(2026, 4, 6),
        duration_days=90,
        target_end_date=date(2026, 7, 4),
        target_weight_kg=5,
        memo="夏までに絞る",
        start_weight_kg=70,
        maintenance_calories=2386,
        daily_calorie_adjustment=400,
        target_calories=1986,
    )

    with (
        patch("service.body_make_plan_service.UserRepository.get_first", return_value=_user()),
        patch(
            "service.body_make_plan_service.BodyMakePlanRepository.find_by_user_and_effective_from",
            return_value=None,
        ),
        patch(
            "service.body_make_plan_service.BodyMakePlanRepository.create",
            return_value=saved_plan,
        ) as mock_create,
    ):
        result = BodyMakePlanService.upsert_plan(object(), request)

    created_plan = mock_create.call_args[0][1]
    assert created_plan.user_id == 1
    assert created_plan.course == GoalCourse.DIET
    assert created_plan.target_end_date == date(2026, 7, 4)
    assert created_plan.target_weight_kg == 5
    assert created_plan.memo == "夏までに絞る"
    assert created_plan.start_weight_kg == 70
    assert created_plan.maintenance_calories == 2386
    assert created_plan.daily_calorie_adjustment == 400
    assert created_plan.target_calories == 1986

    assert result.id == 1
    assert result.course == GoalCourse.DIET
    assert result.target_calories == 1986


def test_upsert_plan_allows_high_pace_diet_plan_when_target_calories_stay_above_basal_metabolism():
    # 目標ペースが強めでも、基礎代謝を下回らない場合は backend では保存可能なことを確認する。
    request = BodyMakePlanUpsertRequest(
        course=GoalCourse.DIET,
        effective_from=date(2026, 4, 8),
        target_weight_kg=5,
        duration_days=30,
        memo="短期で絞る",
    )
    saved_plan = BodyMakePlan(
        id=1,
        user_id=1,
        course=GoalCourse.DIET,
        effective_from=date(2026, 4, 8),
        duration_days=30,
        target_end_date=date(2026, 5, 7),
        target_weight_kg=5,
        memo="短期で絞る",
        start_weight_kg=85,
        maintenance_calories=3356,
        daily_calorie_adjustment=1200,
        target_calories=2156,
    )

    with (
        patch(
            "service.body_make_plan_service.UserRepository.get_first",
            return_value=_user(
                height=180,
                weight=85,
                age=28,
                activity_level=ActivityLevel.ACTIVE,
                basal_metabolism=1800,
                required_calories=3356,
            ),
        ),
        patch(
            "service.body_make_plan_service.BodyMakePlanRepository.find_by_user_and_effective_from",
            return_value=None,
        ),
        patch(
            "service.body_make_plan_service.BodyMakePlanRepository.create",
            return_value=saved_plan,
        ) as mock_create,
    ):
        result = BodyMakePlanService.upsert_plan(object(), request)

    created_plan = mock_create.call_args[0][1]
    assert created_plan.target_end_date == date(2026, 5, 7)
    assert created_plan.daily_calorie_adjustment == 1200
    assert created_plan.target_calories == 2156

    assert result.id == 1
    assert result.course == GoalCourse.DIET
    assert result.target_calories == 2156


def test_upsert_plan_updates_existing_same_day_plan():
    # 同日プランが既にある場合は更新処理が呼ばれることを確認する。
    request = BodyMakePlanUpsertRequest(
        course=GoalCourse.BULK,
        effective_from=date(2026, 5, 1),
        target_weight_kg=5,
        duration_days=60,
        memo="筋量アップ",
    )
    existing_plan = BodyMakePlan(
        id=1,
        user_id=1,
        course=GoalCourse.MAINTENANCE,
        effective_from=date(2026, 5, 1),
        duration_days=0,
        target_end_date=date(2026, 5, 1),
        target_weight_kg=0,
        memo="現状維持",
        start_weight_kg=70,
        maintenance_calories=2386,
        daily_calorie_adjustment=0,
        target_calories=2386,
    )
    updated_plan = BodyMakePlan(
        id=1,
        user_id=1,
        course=GoalCourse.BULK,
        effective_from=date(2026, 5, 1),
        duration_days=60,
        target_end_date=date(2026, 6, 29),
        target_weight_kg=5,
        memo="筋量アップ",
        start_weight_kg=70,
        maintenance_calories=2386,
        daily_calorie_adjustment=600,
        target_calories=2986,
    )

    with (
        patch("service.body_make_plan_service.UserRepository.get_first", return_value=_user()),
        patch(
            "service.body_make_plan_service.BodyMakePlanRepository.find_by_user_and_effective_from",
            return_value=existing_plan,
        ),
        patch(
            "service.body_make_plan_service.BodyMakePlanRepository.update",
            return_value=updated_plan,
        ) as mock_update,
    ):
        result = BodyMakePlanService.upsert_plan(object(), request)

    update_data = mock_update.call_args[0][2]
    assert update_data["course"] == GoalCourse.BULK
    assert update_data["duration_days"] == 60
    assert update_data["target_end_date"] == date(2026, 6, 29)
    assert update_data["target_weight_kg"] == 5
    assert update_data["memo"] == "筋量アップ"
    assert update_data["daily_calorie_adjustment"] == 600
    assert update_data["target_calories"] == 2986

    assert result.id == 1
    assert result.course == GoalCourse.BULK
    assert result.target_calories == 2986


def test_upsert_plan_raises_validation_exception_when_profile_is_missing():
    # プロフィール未登録時はプラン保存前に ValidationException を返すことを確認する。
    request = BodyMakePlanUpsertRequest(
        course=GoalCourse.DIET,
        effective_from=date(2026, 4, 6),
        target_weight_kg=5,
        duration_days=90,
        memo="夏までに絞る",
    )

    with patch("service.body_make_plan_service.UserRepository.get_first", return_value=None):
        with pytest.raises(ValidationException) as exc_info:
            BodyMakePlanService.upsert_plan(object(), request)

    assert exc_info.value.code == BodyMakeErrors.PROFILE_REQUIRED.code
    assert exc_info.value.message == BodyMakeErrors.PROFILE_REQUIRED.message


def test_upsert_plan_raises_validation_exception_for_invalid_maintenance_target():
    # 維持コースで体重目標が 0 以外の場合は ValidationException を返すことを確認する。
    request = BodyMakePlanUpsertRequest(
        course=GoalCourse.MAINTENANCE,
        effective_from=date(2026, 4, 6),
        target_weight_kg=1,
        duration_days=0,
        memo="維持のつもり",
    )

    with patch("service.body_make_plan_service.UserRepository.get_first", return_value=_user()):
        with pytest.raises(ValidationException) as exc_info:
            BodyMakePlanService.upsert_plan(object(), request)

    assert exc_info.value.code == BodyMakeErrors.INVALID_TARGET_WEIGHT_KG.code
    assert exc_info.value.message == BodyMakeErrors.INVALID_TARGET_WEIGHT_KG.message


def test_upsert_plan_raises_validation_exception_for_invalid_duration():
    # ダイエット・増量コースで期間 0 の場合は ValidationException を返すことを確認する。
    request = BodyMakePlanUpsertRequest(
        course=GoalCourse.DIET,
        effective_from=date(2026, 4, 6),
        target_weight_kg=5,
        duration_days=0,
        memo="短期集中",
    )

    with patch("service.body_make_plan_service.UserRepository.get_first", return_value=_user()):
        with pytest.raises(ValidationException) as exc_info:
            BodyMakePlanService.upsert_plan(object(), request)

    assert exc_info.value.code == BodyMakeErrors.INVALID_DURATION_DAYS.code
    assert exc_info.value.message == BodyMakeErrors.INVALID_DURATION_DAYS.message


def test_upsert_plan_raises_validation_exception_when_target_calories_fall_below_basal_metabolism():
    # 目標摂取カロリーが基礎代謝を下回る場合は ValidationException を返すことを確認する。
    request = BodyMakePlanUpsertRequest(
        course=GoalCourse.DIET,
        effective_from=date(2026, 4, 8),
        target_weight_kg=5,
        duration_days=15,
        memo="短期で絞る",
    )

    with patch(
        "service.body_make_plan_service.UserRepository.get_first",
        return_value=_user(
            height=165,
            weight=70,
            age=26,
            basal_metabolism=1678,
            required_calories=2600,
        ),
    ):
        with pytest.raises(ValidationException) as exc_info:
            BodyMakePlanService.upsert_plan(object(), request)

    assert exc_info.value.code == BodyMakeErrors.TARGET_CALORIES_TOO_LOW.code
    assert exc_info.value.message == BodyMakeErrors.TARGET_CALORIES_TOO_LOW.message


def test_get_latest_plan_raises_repository_exception_on_sqlalchemy_error():
    # DB 例外が発生した場合は RepositoryException に変換されることを確認する。
    with (
        patch("service.body_make_plan_service.UserRepository.get_first", return_value=_user()),
        patch(
            "service.body_make_plan_service.BodyMakePlanRepository.find_latest_by_user",
            side_effect=SQLAlchemyError("db error"),
        ),
    ):
        with pytest.raises(RepositoryException) as exc_info:
            BodyMakePlanService.get_latest_plan(object())

    assert exc_info.value.code == BodyMakeErrors.DB_FETCH_ERROR.code
    assert exc_info.value.message == BodyMakeErrors.DB_FETCH_ERROR.message


def test_upsert_plan_raises_repository_exception_on_sqlalchemy_error():
    # DB 例外が発生した場合は RepositoryException に変換されることを確認する。
    request = BodyMakePlanUpsertRequest(
        course=GoalCourse.DIET,
        effective_from=date(2026, 4, 6),
        target_weight_kg=5,
        duration_days=90,
        memo="夏までに絞る",
    )

    with (
        patch("service.body_make_plan_service.UserRepository.get_first", return_value=_user()),
        patch(
            "service.body_make_plan_service.BodyMakePlanRepository.find_by_user_and_effective_from",
            side_effect=SQLAlchemyError("db error"),
        ),
    ):
        with pytest.raises(RepositoryException) as exc_info:
            BodyMakePlanService.upsert_plan(object(), request)

    assert exc_info.value.code == BodyMakeErrors.DB_SAVE_ERROR.code
    assert exc_info.value.message == BodyMakeErrors.DB_SAVE_ERROR.message

def test_upsert_plan_allows_high_pace_bulk_plan():
    # 増量ペースが高めでも、backend では警告のみの扱いとして保存可能なことを確認する。
    request = BodyMakePlanUpsertRequest(
        course=GoalCourse.BULK,
        effective_from=date(2026, 4, 8),
        target_weight_kg=3,
        duration_days=30,
        memo="筋量アップ",
    )
    saved_plan = BodyMakePlan(
        id=1,
        user_id=1,
        course=GoalCourse.BULK,
        effective_from=date(2026, 4, 8),
        duration_days=30,
        target_end_date=date(2026, 5, 7),
        target_weight_kg=3,
        memo="筋量アップ",
        start_weight_kg=70,
        maintenance_calories=2386,
        daily_calorie_adjustment=720,
        target_calories=3106,
    )

    with (
        patch("service.body_make_plan_service.UserRepository.get_first", return_value=_user()),
        patch(
            "service.body_make_plan_service.BodyMakePlanRepository.find_by_user_and_effective_from",
            return_value=None,
        ),
        patch(
            "service.body_make_plan_service.BodyMakePlanRepository.create",
            return_value=saved_plan,
        ) as mock_create,
    ):
        result = BodyMakePlanService.upsert_plan(object(), request)

    created_plan = mock_create.call_args[0][1]
    assert created_plan.course == GoalCourse.BULK
    assert created_plan.target_end_date == date(2026, 5, 7)
    assert created_plan.daily_calorie_adjustment == 720
    assert created_plan.target_calories == 3106

    assert result.id == 1
    assert result.course == GoalCourse.BULK
    assert result.target_calories == 3106
