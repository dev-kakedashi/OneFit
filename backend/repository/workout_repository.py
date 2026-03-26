from datetime import datetime, time

from models.workout import Workout
from sqlalchemy.orm import Session


class WorkoutRepository:
    @staticmethod
    def find_by_date(db: Session, target_date: datetime) -> list[Workout]:
        start_datetime = datetime.combine(target_date.date(), time.min)
        end_datetime = datetime.combine(target_date.date(), time.max)

        return (
            db.query(Workout)
            .filter(
                Workout.worked_out_at >= start_datetime,
                Workout.worked_out_at <= end_datetime,
            )
            .order_by(Workout.worked_out_at.asc())
            .all()
        )

    @staticmethod
    def find_by_id(db: Session, workout_id: int) -> Workout | None:
        return db.query(Workout).filter(Workout.id == workout_id).first()

    @staticmethod
    def create(db: Session, workout: Workout) -> Workout:
        db.add(workout)
        db.commit()
        db.refresh(workout)
        return workout

    @staticmethod
    def update(
        db: Session,
        existing_workout: Workout,
        update_data: dict,
    ) -> Workout:
        for key, value in update_data.items():
            setattr(existing_workout, key, value)

        db.commit()
        db.refresh(existing_workout)
        return existing_workout

    @staticmethod
    def delete(db: Session, existing_workout: Workout) -> None:
        db.delete(existing_workout)
        db.commit()
