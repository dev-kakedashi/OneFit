from datetime import datetime, time

from models.water_log import WaterLog
from sqlalchemy.orm import Session


class WaterRepository:
    @staticmethod
    def find_by_date(db: Session, target_date: datetime) -> list[WaterLog]:
        start_datetime = datetime.combine(target_date.date(), time.min)
        end_datetime = datetime.combine(target_date.date(), time.max)

        return (
            db.query(WaterLog)
            .filter(WaterLog.drank_at >= start_datetime, WaterLog.drank_at <= end_datetime)
            .order_by(WaterLog.drank_at.asc())
            .all()
        )

    @staticmethod
    def find_by_id(db: Session, water_log_id: int) -> WaterLog | None:
        return db.query(WaterLog).filter(WaterLog.id == water_log_id).first()

    @staticmethod
    def find_in_range(
        db: Session,
        start_datetime: datetime,
        end_datetime: datetime,
    ) -> list[WaterLog]:
        return (
            db.query(WaterLog)
            .filter(
                WaterLog.drank_at >= start_datetime,
                WaterLog.drank_at < end_datetime,
            )
            .order_by(WaterLog.drank_at.asc())
            .all()
        )

    @staticmethod
    def create(db: Session, water_log: WaterLog) -> WaterLog:
        db.add(water_log)
        db.commit()
        db.refresh(water_log)
        return water_log

    @staticmethod
    def update(
        db: Session,
        existing_water_log: WaterLog,
        update_data: dict,
    ) -> WaterLog:
        for key, value in update_data.items():
            setattr(existing_water_log, key, value)

        db.commit()
        db.refresh(existing_water_log)
        return existing_water_log

    @staticmethod
    def delete(db: Session, existing_water_log: WaterLog) -> None:
        db.delete(existing_water_log)
        db.commit()
