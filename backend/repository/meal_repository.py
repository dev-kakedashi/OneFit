from datetime import datetime, time

from models.meal import Meal
from sqlalchemy.orm import Session


class MealRepository:
    @staticmethod
    def find_by_date(db: Session, target_date: datetime) -> list[Meal]:
        start_datetime = datetime.combine(target_date.date(), time.min)
        end_datetime = datetime.combine(target_date.date(), time.max)

        return (
            db.query(Meal)
            .filter(Meal.eaten_at >= start_datetime, Meal.eaten_at <= end_datetime)
            .order_by(Meal.eaten_at.asc())
            .all()
        )

    @staticmethod
    def find_by_id(db: Session, meal_id: int) -> Meal | None:
        return db.query(Meal).filter(Meal.id == meal_id).first()

    @staticmethod
    def create(db: Session, meal: Meal) -> Meal:
        db.add(meal)
        db.commit()
        db.refresh(meal)
        return meal

    @staticmethod
    def update(db: Session, existing_meal: Meal, update_data: dict) -> Meal:
        for key, value in update_data.items():
            setattr(existing_meal, key, value)

        db.commit()
        db.refresh(existing_meal)
        return existing_meal

    @staticmethod
    def delete(db: Session, existing_meal: Meal) -> None:
        db.delete(existing_meal)
        db.commit()
