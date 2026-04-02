from datetime import datetime

from db.base import Base
from sqlalchemy import DateTime, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column


class WaterLog(Base):
    __tablename__ = "water_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    amount_ml: Mapped[int] = mapped_column(Integer, nullable=False)

    drank_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

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
