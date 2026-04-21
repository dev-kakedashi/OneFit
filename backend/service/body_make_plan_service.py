from common.errors.errors import BodyMakeErrors
from common.errors.exceptions import (
    AppException,
    RepositoryException,
    ServiceException,
    ValidationException,
)
from domain.user.calculators import (
    calculate_target_calories_for_plan,
    calculate_target_end_date,
)
from enums.goal_course import GoalCourse
from models.body_make_plan import BodyMakePlan
from repository.body_make_plan_repository import BodyMakePlanRepository
from repository.user_repository import UserRepository
from schemas.request.body_make_plan_request import BodyMakePlanUpsertRequest
from schemas.response.body_make_plan_response import BodyMakePlanResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session


class BodyMakePlanService:
    """ボディメイク計画の取得と保存を担当するサービス。"""

    @staticmethod
    def get_latest_plan(db: Session) -> BodyMakePlanResponse | None:
        """最新のボディメイク計画を取得する。

        Args:
            db: DBセッション。

        Returns:
            最新のボディメイク計画。未登録の場合は ``None`` を返す。

        Raises:
            RepositoryException: DB取得処理で障害が発生した場合。
            ServiceException: 想定外のサービス層エラーが発生した場合。
        """
        try:
            user = UserRepository.get_first(db)
            if user is None:
                return None

            plan = BodyMakePlanRepository.find_latest_by_user(db, user.id)
            if plan is None:
                return None

            return BodyMakePlanResponse.model_validate(plan)
        except AppException:
            raise
        except SQLAlchemyError as error:
            raise RepositoryException(
                BodyMakeErrors.DB_FETCH_ERROR, error=error
            ) from error
        except Exception as error:
            raise ServiceException(BodyMakeErrors.FETCH_FAILED, error=error) from error

    @staticmethod
    def list_plans(db: Session) -> list[BodyMakePlanResponse]:
        """登録済みのボディメイク計画一覧を取得する。

        Args:
            db: DBセッション。

        Returns:
            ボディメイク計画一覧。未登録の場合は空配列を返す。

        Raises:
            RepositoryException: DB取得処理で障害が発生した場合。
            ServiceException: 想定外のサービス層エラーが発生した場合。
        """
        try:
            user = UserRepository.get_first(db)
            if user is None:
                return []

            plans = BodyMakePlanRepository.find_all_by_user(db, user.id)
            return [BodyMakePlanResponse.model_validate(plan) for plan in plans]
        except AppException:
            raise
        except SQLAlchemyError as error:
            raise RepositoryException(
                BodyMakeErrors.DB_FETCH_ERROR, error=error
            ) from error
        except Exception as error:
            raise ServiceException(BodyMakeErrors.FETCH_FAILED, error=error) from error

    @staticmethod
    def upsert_plan(
        db: Session,
        request: BodyMakePlanUpsertRequest,
    ) -> BodyMakePlanResponse:
        """ボディメイク計画を新規作成または同日付で更新する。

        Args:
            db: DBセッション。
            request: 保存対象の計画入力値。

        Returns:
            保存後のボディメイク計画。

        Raises:
            ValidationException: 業務バリデーションに違反する場合。
            RepositoryException: DB保存処理で障害が発生した場合。
            ServiceException: 想定外のサービス層エラーが発生した場合。
        """
        try:
            user = UserRepository.get_first(db)
            if user is None:
                raise ValidationException(BodyMakeErrors.PROFILE_REQUIRED)

            maintenance_calories = int(user.required_calories)
            basal_metabolism = int(user.basal_metabolism)

            BodyMakePlanService._validate_request(request)
            BodyMakePlanService._validate_plan_safety(
                request=request,
                maintenance_calories=maintenance_calories,
                basal_metabolism=basal_metabolism,
            )

            plan_data = BodyMakePlanService._build_plan_data(
                request=request,
                user_id=user.id,
                start_weight_kg=user.weight,
                maintenance_calories=maintenance_calories,
            )

            existing_plan = BodyMakePlanRepository.find_by_user_and_effective_from(
                db=db,
                user_id=user.id,
                effective_from=request.effective_from,
            )

            if existing_plan is None:
                saved_plan = BodyMakePlanRepository.create(
                    db,
                    BodyMakePlan(**plan_data),
                )
            else:
                saved_plan = BodyMakePlanRepository.update(
                    db,
                    existing_plan,
                    plan_data,
                )

            return BodyMakePlanResponse.model_validate(saved_plan)
        except AppException:
            raise
        except SQLAlchemyError as error:
            raise RepositoryException(
                BodyMakeErrors.DB_SAVE_ERROR, error=error
            ) from error
        except Exception as error:
            raise ServiceException(BodyMakeErrors.SAVE_FAILED, error=error) from error

    @staticmethod
    def _validate_request(request: BodyMakePlanUpsertRequest) -> None:
        """計画入力値の業務バリデーションを行う。

        Args:
            request: 計画入力値。

        Raises:
            ValidationException: 入力内容が業務ルールに違反する場合。
        """
        if request.course == GoalCourse.MAINTENANCE:
            if request.target_weight_kg != 0:
                raise ValidationException(BodyMakeErrors.INVALID_TARGET_WEIGHT_KG)
            if request.duration_days != 0:
                raise ValidationException(BodyMakeErrors.INVALID_DURATION_DAYS)
            return

        if request.target_weight_kg <= 0:
            raise ValidationException(BodyMakeErrors.INVALID_TARGET_WEIGHT_KG)

        if request.duration_days <= 0:
            raise ValidationException(BodyMakeErrors.INVALID_DURATION_DAYS)

    @staticmethod
    def _validate_plan_safety(
        request: BodyMakePlanUpsertRequest,
        maintenance_calories: int,
        basal_metabolism: int,
    ) -> None:
        """ダイエット計画の最低安全ラインを検証する。

        frontend では warning / danger の注意喚起を行うが、
        backend では最低限、基礎代謝を下回る危険な計画だけを拒否する。

        Args:
            request: 計画入力値。
            maintenance_calories: 維持カロリー。
            basal_metabolism: 基礎代謝量。

        Raises:
            ValidationException: 安全ラインを下回る場合。
        """
        if request.course != GoalCourse.DIET:
            return

        _, target_calories = calculate_target_calories_for_plan(
            maintenance_calories=maintenance_calories,
            course=request.course,
            target_weight_kg=request.target_weight_kg,
            duration_days=request.duration_days,
        )

        if target_calories < basal_metabolism:
            raise ValidationException(BodyMakeErrors.TARGET_CALORIES_TOO_LOW)

    @staticmethod
    def _build_plan_data(
        request: BodyMakePlanUpsertRequest,
        user_id: int,
        start_weight_kg: float,
        maintenance_calories: int,
    ) -> dict:
        """保存用のボディメイク計画データを組み立てる。

        Args:
            request: 計画入力値。
            user_id: 紐づくユーザーID。
            start_weight_kg: 計画開始時点の体重。
            maintenance_calories: 維持カロリー。

        Returns:
            DB保存用の辞書データ。
        """
        daily_calorie_adjustment, target_calories = calculate_target_calories_for_plan(
            maintenance_calories=maintenance_calories,
            course=request.course,
            target_weight_kg=request.target_weight_kg,
            duration_days=request.duration_days,
        )
        target_end_date = calculate_target_end_date(
            effective_from=request.effective_from,
            duration_days=request.duration_days,
        )

        return {
            "user_id": user_id,
            "course": request.course,
            "effective_from": request.effective_from,
            "duration_days": request.duration_days,
            "target_end_date": target_end_date,
            "target_weight_kg": request.target_weight_kg,
            "memo": request.memo,
            "start_weight_kg": start_weight_kg,
            "maintenance_calories": maintenance_calories,
            "daily_calorie_adjustment": daily_calorie_adjustment,
            "target_calories": target_calories,
        }
