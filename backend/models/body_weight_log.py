from datetime import date, datetime

from db.base import Base
from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column


class BodyWeightLog(Base):
    __tablename__ = "body_weight_logs"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "measured_on",
            name="uq_body_weight_logs_user_id_measured_on",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    measured_on: Mapped[date] = mapped_column(Date, nullable=False)

    weight_kg: Mapped[float] = mapped_column(Float, nullable=False)

    memo: Mapped[str | None] = mapped_column(Text, nullable=True)

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
