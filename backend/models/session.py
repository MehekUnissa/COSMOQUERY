from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime

from database import Base


class Session(Base):
    __tablename__ = "sessions"

    id = Column(
        String(100),
        primary_key=True,
        index=True
    )

    context = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )