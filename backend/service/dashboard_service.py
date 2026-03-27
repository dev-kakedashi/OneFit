from datetime import date, datetime, time

from common.errors.errors import DashboardErrors
from common.errors.exceptions import AppException, RepositoryException, ServiceException
from repository.meal_repository import MealRepository
from repository.user_repository import UserRepository
from repository.workout_repository import WorkoutRepository
from schemas.response.dashboard_response import (
    DailySummaryResponse,
    DashboardDailySummaryResponse,
)
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session


class DashboardService:
    """ダッシュボードの日次サマリーを集計するサービス。"""

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

            intake_calories = sum(meal.calories for meal in meals)
            burned_calories = sum(workout.burned_calories for workout in workouts)

            if user is None:
                summary = DailySummaryResponse(
                    target_calories=None,
                    intake_calories=intake_calories,
                    burned_calories=burned_calories,
                    calorie_balance=None,
                    profile_registered=False,
                )
            else:
                target_calories = int(user.required_calories)
                summary = DailySummaryResponse(
                    target_calories=target_calories,
                    intake_calories=intake_calories,
                    burned_calories=burned_calories,
                    calorie_balance=intake_calories - burned_calories - target_calories,
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
