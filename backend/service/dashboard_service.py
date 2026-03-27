from datetime import date, datetime, time

from repository.meal_repository import MealRepository
from repository.user_repository import UserRepository
from repository.workout_repository import WorkoutRepository
from schemas.response.dashboard_response import (
    DailySummaryResponse,
    DashboardDailySummaryResponse,
)
from sqlalchemy.orm import Session


class DashboardService:
    """ダッシュボードの日次サマリーを集計するサービス。"""

    @staticmethod
    def get_daily_summary(
        db: Session,
        target_date: date,
    ) -> DashboardDailySummaryResponse:
        """指定日のカロリー収支サマリーを返す。"""

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
