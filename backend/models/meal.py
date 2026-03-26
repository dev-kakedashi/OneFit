from datetime import datetime

from db.base import Base
from sqlalchemy import BigInteger, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column


class Meal(Base):
    __tablename__ = "meals"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)

    meal_name: Mapped[str] = mapped_column(String(100), nullable=False)

    calories: Mapped[int] = mapped_column(Integer, nullable=False)

    eaten_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

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
