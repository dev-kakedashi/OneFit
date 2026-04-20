from datetime import date

from models.body_weight_log import BodyWeightLog
from sqlalchemy.orm import Session


class BodyWeightLogRepository:
    @staticmethod
    def find_by_date_range(
        db: Session,
        user_id: int,
        date_from: date | None = None,
        date_to: date | None = None,
    ) -> list[BodyWeightLog]:
        query = db.query(BodyWeightLog).filter(BodyWeightLog.user_id == user_id)

        if date_from is not None:
            query = query.filter(BodyWeightLog.measured_on >= date_from)

        if date_to is not None:
            query = query.filter(BodyWeightLog.measured_on <= date_to)

        return query.order_by(BodyWeightLog.measured_on.desc()).all()

    @staticmethod
    def find_by_user_and_measured_on(
        db: Session,
        user_id: int,
        measured_on: date,
    ) -> BodyWeightLog | None:
        return (
            db.query(BodyWeightLog)
            .filter(
                BodyWeightLog.user_id == user_id,
                BodyWeightLog.measured_on == measured_on,
            )
            .first()
        )

    @staticmethod
    def find_latest_on_or_before(
        db: Session,
        user_id: int,
        target_date: date,
    ) -> BodyWeightLog | None:
        return (
            db.query(BodyWeightLog)
            .filter(
                BodyWeightLog.user_id == user_id,
                BodyWeightLog.measured_on <= target_date,
            )
            .order_by(BodyWeightLog.measured_on.desc(), BodyWeightLog.id.desc())
            .first()
        )

    @staticmethod
    def find_latest_before(
        db: Session,
        user_id: int,
        target_date: date,
    ) -> BodyWeightLog | None:
        return (
            db.query(BodyWeightLog)
            .filter(
                BodyWeightLog.user_id == user_id,
                BodyWeightLog.measured_on < target_date,
            )
            .order_by(BodyWeightLog.measured_on.desc(), BodyWeightLog.id.desc())
            .first()
        )

    @staticmethod
    def find_by_id(db: Session, body_weight_log_id: int) -> BodyWeightLog | None:
        return (
            db.query(BodyWeightLog)
            .filter(BodyWeightLog.id == body_weight_log_id)
            .first()
        )

    @staticmethod
    def create(db: Session, body_weight_log: BodyWeightLog) -> BodyWeightLog:
        db.add(body_weight_log)
        db.commit()
        db.refresh(body_weight_log)
        return body_weight_log

    @staticmethod
    def update(
        db: Session,
        existing_body_weight_log: BodyWeightLog,
        update_data: dict,
    ) -> BodyWeightLog:
        for key, value in update_data.items():
            setattr(existing_body_weight_log, key, value)

        db.commit()
        db.refresh(existing_body_weight_log)
        return existing_body_weight_log

    @staticmethod
    def delete(db: Session, existing_body_weight_log: BodyWeightLog) -> None:
        db.delete(existing_body_weight_log)
        db.commit()
