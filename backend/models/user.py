from datetime import datetime

from db.base import Base
from enums.activity_level import ActivityLevel
from enums.gender import Gender
from sqlalchemy import (
    DateTime,
    Enum,
    Float,
    Integer,
)
from sqlalchemy.orm import Mapped, mapped_column


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    height: Mapped[float] = mapped_column(Float, nullable=False)

    weight: Mapped[float] = mapped_column(Float, nullable=False)

    age: Mapped[int] = mapped_column(Integer, nullable=False)

    gender: Mapped[Gender] = mapped_column(
        Enum(
            Gender,
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
            name="gender",
        ),
        nullable=False,
    )

    activity_level: Mapped[ActivityLevel] = mapped_column(
        Enum(
            ActivityLevel,
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
            name="activity_level",
        ),
        nullable=False,
    )

    basal_metabolism: Mapped[float] = mapped_column(Float, nullable=False)

    required_calories: Mapped[float] = mapped_column(Float, nullable=False)

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
