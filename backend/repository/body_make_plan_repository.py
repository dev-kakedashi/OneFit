from datetime import date

from models.body_make_plan import BodyMakePlan
from sqlalchemy.orm import Session


class BodyMakePlanRepository:
    @staticmethod
    def find_latest_by_user(db: Session, user_id: int) -> BodyMakePlan | None:
        return (
            db.query(BodyMakePlan)
            .filter(BodyMakePlan.user_id == user_id)
            .order_by(
                BodyMakePlan.effective_from.desc(),
                BodyMakePlan.id.desc(),
            )
            .first()
        )

    @staticmethod
    def find_all_by_user(db: Session, user_id: int) -> list[BodyMakePlan]:
        return (
            db.query(BodyMakePlan)
            .filter(BodyMakePlan.user_id == user_id)
            .order_by(
                BodyMakePlan.effective_from.desc(),
                BodyMakePlan.id.desc(),
            )
            .all()
        )

    @staticmethod
    def find_by_user_and_effective_from(
        db: Session,
        user_id: int,
        effective_from: date,
    ) -> BodyMakePlan | None:
        return (
            db.query(BodyMakePlan)
            .filter(
                BodyMakePlan.user_id == user_id,
                BodyMakePlan.effective_from == effective_from,
            )
            .first()
        )

    @staticmethod
    def find_effective_on_date(
        db: Session,
        user_id: int,
        target_date: date,
    ) -> BodyMakePlan | None:
        return (
            db.query(BodyMakePlan)
            .filter(
                BodyMakePlan.user_id == user_id,
                BodyMakePlan.effective_from <= target_date,
            )
            .order_by(
                BodyMakePlan.effective_from.desc(),
                BodyMakePlan.id.desc(),
            )
            .first()
        )

    @staticmethod
    def create(db: Session, plan: BodyMakePlan) -> BodyMakePlan:
        db.add(plan)
        db.commit()
        db.refresh(plan)
        return plan

    @staticmethod
    def update(db: Session, existing_plan: BodyMakePlan, update_data: dict) -> BodyMakePlan:
        for key, value in update_data.items():
            setattr(existing_plan, key, value)

        db.commit()
        db.refresh(existing_plan)
        return existing_plan
