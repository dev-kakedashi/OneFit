from datetime import date, datetime

from db.base import Base
from enums.goal_course import GoalCourse
from sqlalchemy import Date, DateTime, Enum, Float, ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column


class BodyMakePlan(Base):
    __tablename__ = "body_make_plans"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "effective_from",
            name="uq_body_make_plans_user_id_effective_from",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    course: Mapped[GoalCourse] = mapped_column(
        Enum(
            GoalCourse,
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
            name="goal_course",
        ),
        nullable=False,
    )

    effective_from: Mapped[date] = mapped_column(Date, nullable=False)

    duration_days: Mapped[int] = mapped_column(Integer, nullable=False)

    target_end_date: Mapped[date] = mapped_column(Date, nullable=False)

    target_weight_kg: Mapped[float] = mapped_column(Float, nullable=False)

    memo: Mapped[str | None] = mapped_column(Text, nullable=True)

    start_weight_kg: Mapped[float] = mapped_column(Float, nullable=False)

    maintenance_calories: Mapped[int] = mapped_column(Integer, nullable=False)

    daily_calorie_adjustment: Mapped[int] = mapped_column(Integer, nullable=False)

    target_calories: Mapped[int] = mapped_column(Integer, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
        onupdate=datetime.now,
    )
