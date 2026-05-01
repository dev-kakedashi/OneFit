from datetime import date, datetime, time, timedelta

from common.errors.errors import DashboardErrors
from common.errors.exceptions import AppException, RepositoryException, ServiceException
from repository.body_weight_log_repository import BodyWeightLogRepository
from repository.body_make_plan_repository import BodyMakePlanRepository
from repository.meal_repository import MealRepository
from repository.user_repository import UserRepository
from repository.water_repository import WaterRepository
from repository.workout_repository import WorkoutRepository
from schemas.response.dashboard_response import (
    DailySummaryResponse,
    DashboardDailySummaryResponse,
    DashboardPeriodSummaryResponse,
    DashboardMonthlyMarkerResponse,
    DashboardMonthlyMarkersResponse,
    PeriodSummaryResponse,
)
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session


class DashboardService:
    """ダッシュボードの日次サマリーを集計するサービス。"""

    @staticmethod
    def _get_week_range(target_date: date) -> tuple[date, date]:
        """対象日を含む月曜始まり・日曜終わりの週範囲を返す。"""
        week_start_date = target_date - timedelta(days=target_date.weekday())
        week_end_date = week_start_date + timedelta(days=6)
        return week_start_date, week_end_date

    @staticmethod
    def get_daily_summary(
        db: Session,
        target_date: date,
    ) -> DashboardDailySummaryResponse:
        """指定日のダッシュボード集計結果を返す。

        Args:
            db: DBセッション。
            target_date: 集計対象日。

        Returns:
            指定日の日次サマリー。

        Raises:
            RepositoryException: DB取得処理で障害が発生した場合。
            ServiceException: 想定外のサービス層エラーが発生した場合。
        """
        try:
            start_datetime = datetime.combine(target_date, time.min)
            user = UserRepository.get_first(db)
            meals = MealRepository.find_by_date(db, start_datetime)
            workouts = WorkoutRepository.find_by_date(db, start_datetime)
            water_logs = WaterRepository.find_by_date(db, start_datetime)

            intake_calories = sum(meal.calories for meal in meals)
            burned_calories = sum(workout.burned_calories for workout in workouts)
            water_intake_ml = sum(water_log.amount_ml for water_log in water_logs)

            if user is None:
                summary = DailySummaryResponse(
                    target_calories=None,
                    maintenance_calories=None,
                    daily_calorie_adjustment=None,
                    intake_calories=intake_calories,
                    burned_calories=burned_calories,
                    calorie_balance=None,
                    target_water_intake_ml=None,
                    water_intake_ml=water_intake_ml,
                    remaining_water_intake_ml=None,
                    course=None,
                    target_end_date=None,
                    target_weight_kg=None,
                    start_weight_kg=None,
                    memo=None,
                    body_make_plan_registered=False,
                    profile_registered=False,
                )
            else:
                plan = BodyMakePlanRepository.find_effective_on_date(
                    db=db,
                    user_id=user.id,
                    target_date=target_date,
                )

                target_calories = (
                    plan.target_calories if plan is not None else int(user.required_calories)
                )
                maintenance_calories = (
                    plan.maintenance_calories
                    if plan is not None
                    else int(user.required_calories)
                )
                daily_calorie_adjustment = (
                    plan.daily_calorie_adjustment if plan is not None else 0
                )
                target_water_intake_ml = user.daily_water_goal_ml
                remaining_water_intake_ml = (
                    None
                    if target_water_intake_ml is None
                    else max(target_water_intake_ml - water_intake_ml, 0)
                )

                summary = DailySummaryResponse(
                    target_calories=target_calories,
                    maintenance_calories=maintenance_calories,
                    daily_calorie_adjustment=daily_calorie_adjustment,
                    intake_calories=intake_calories,
                    burned_calories=burned_calories,
                    # 画面上は「食べられる残り」を示したいので、運動量ではなく摂取目標との差分で返す。
                    calorie_balance=target_calories - intake_calories,
                    target_water_intake_ml=target_water_intake_ml,
                    water_intake_ml=water_intake_ml,
                    remaining_water_intake_ml=remaining_water_intake_ml,
                    course=plan.course if plan is not None else None,
                    target_end_date=plan.target_end_date if plan is not None else None,
                    target_weight_kg=plan.target_weight_kg if plan is not None else None,
                    start_weight_kg=plan.start_weight_kg if plan is not None else None,
                    memo=plan.memo if plan is not None else None,
                    body_make_plan_registered=plan is not None,
                    profile_registered=True,
                )

            return DashboardDailySummaryResponse(summary=summary)
        except AppException:
            raise
        except SQLAlchemyError as error:
            raise RepositoryException(
                DashboardErrors.DB_FETCH_ERROR, error=error
            ) from error
        except Exception as error:
            raise ServiceException(DashboardErrors.FETCH_FAILED, error=error) from error

    @staticmethod
    def get_period_summary(
        db: Session,
        target_date: date,
    ) -> DashboardPeriodSummaryResponse:
        """指定日を含む週次集計結果を返す。"""
        try:
            window_start_date, window_end_date = DashboardService._get_week_range(
                target_date
            )
            start_datetime = datetime.combine(window_start_date, time.min)
            end_datetime = datetime.combine(window_end_date + timedelta(days=1), time.min)

            meals = MealRepository.find_in_range(db, start_datetime, end_datetime)
            workouts = WorkoutRepository.find_in_range(db, start_datetime, end_datetime)
            water_logs = WaterRepository.find_in_range(db, start_datetime, end_datetime)
            user = UserRepository.get_first(db)

            body_weight_logs = []
            body_weight_reference_log = None
            calorie_target_total = None
            water_target_total_ml = None
            if user is not None:
                calorie_target_total = 0
                for current_offset in range(7):
                    current_date = window_start_date + timedelta(days=current_offset)
                    plan = BodyMakePlanRepository.find_effective_on_date(
                        db=db,
                        user_id=user.id,
                        target_date=current_date,
                    )
                    calorie_target_total += (
                        plan.target_calories
                        if plan is not None
                        else int(user.required_calories)
                    )

                if user.daily_water_goal_ml is not None:
                    water_target_total_ml = user.daily_water_goal_ml * 7

                body_weight_reference_log = BodyWeightLogRepository.find_latest_on_or_before(
                    db=db,
                    user_id=user.id,
                    target_date=window_start_date,
                )
                body_weight_logs = BodyWeightLogRepository.find_by_date_range(
                    db=db,
                    user_id=user.id,
                    date_from=window_start_date,
                    date_to=window_end_date,
                )

            meal_dates = {meal.eaten_at.date() for meal in meals}
            workout_dates = {workout.worked_out_at.date() for workout in workouts}
            water_dates = {water_log.drank_at.date() for water_log in water_logs}
            body_weight_dates = {
                body_weight_log.measured_on for body_weight_log in body_weight_logs
            }

            sorted_body_weight_logs = sorted(
                body_weight_logs,
                key=lambda log: (log.measured_on, log.id),
            )
            body_weight_start_kg = None
            body_weight_end_kg = None
            body_weight_change_kg = None
            if sorted_body_weight_logs:
                body_weight_start_kg = (
                    body_weight_reference_log.weight_kg
                    if body_weight_reference_log is not None
                    else sorted_body_weight_logs[0].weight_kg
                )
                body_weight_end_kg = sorted_body_weight_logs[-1].weight_kg
                body_weight_change_kg = body_weight_end_kg - body_weight_start_kg

            summary = PeriodSummaryResponse(
                window_start_date=window_start_date,
                window_end_date=window_end_date,
                window_days=7,
                calorie_target_total=calorie_target_total,
                intake_calories=sum(meal.calories for meal in meals),
                burned_calories=sum(workout.burned_calories for workout in workouts),
                water_target_total_ml=water_target_total_ml,
                water_intake_ml=sum(water_log.amount_ml for water_log in water_logs),
                meal_log_count=len(meals),
                meal_day_count=len(meal_dates),
                workout_log_count=len(workouts),
                workout_day_count=len(workout_dates),
                water_log_count=len(water_logs),
                water_day_count=len(water_dates),
                body_weight_log_count=len(body_weight_logs),
                body_weight_day_count=len(body_weight_dates),
                recorded_day_count=len(
                    meal_dates | workout_dates | water_dates | body_weight_dates
                ),
                body_weight_start_kg=body_weight_start_kg,
                body_weight_end_kg=body_weight_end_kg,
                body_weight_change_kg=body_weight_change_kg,
                profile_registered=user is not None,
            )

            return DashboardPeriodSummaryResponse(summary=summary)
        except AppException:
            raise
        except SQLAlchemyError as error:
            raise RepositoryException(
                DashboardErrors.DB_FETCH_ERROR, error=error
            ) from error
        except Exception as error:
            raise ServiceException(DashboardErrors.FETCH_FAILED, error=error) from error

    @staticmethod
    def get_monthly_markers(
        db: Session,
        target_month: date,
    ) -> DashboardMonthlyMarkersResponse:
        """指定月の記録マーカー一覧を返す。

        Args:
            db: DBセッション。
            target_month: 月判定に使う任意の日付。この年月を集計対象とする。

        Returns:
            カレンダー表示用の月次マーカー一覧。

        Raises:
            RepositoryException: DB取得処理で障害が発生した場合。
            ServiceException: 想定外のサービス層エラーが発生した場合。
        """
        try:
            month_start = date(target_month.year, target_month.month, 1)
            next_month_start = (
                date(target_month.year + 1, 1, 1)
                if target_month.month == 12
                else date(target_month.year, target_month.month + 1, 1)
            )
            start_datetime = datetime.combine(month_start, time.min)
            end_datetime = datetime.combine(next_month_start, time.min)

            meals = MealRepository.find_in_range(db, start_datetime, end_datetime)
            workouts = WorkoutRepository.find_in_range(db, start_datetime, end_datetime)

            meal_dates = {meal.eaten_at.date() for meal in meals}
            workout_dates = {workout.worked_out_at.date() for workout in workouts}
            marker_dates = sorted(meal_dates | workout_dates)

            return DashboardMonthlyMarkersResponse(
                markers=[
                    DashboardMonthlyMarkerResponse(
                        date=marker_date,
                        has_meal=marker_date in meal_dates,
                        has_workout=marker_date in workout_dates,
                    )
                    for marker_date in marker_dates
                ]
            )
        except AppException:
            raise
        except SQLAlchemyError as error:
            raise RepositoryException(
                DashboardErrors.DB_FETCH_ERROR, error=error
            ) from error
        except Exception as error:
            raise ServiceException(DashboardErrors.FETCH_FAILED, error=error) from error
