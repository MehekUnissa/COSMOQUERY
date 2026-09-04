from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    Text,
    Float,
    DateTime,
    ForeignKey
)

from database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(
        String(100),
        primary_key=True,
        index=True
    )

    session_id = Column(
        String(100),
        ForeignKey("sessions.id"),
        nullable=False,
        index=True
    )

    filename = Column(
        String(500),
        nullable=True
    )

    modality = Column(
        String(50),
        nullable=True
    )

    question = Column(
        Text,
        nullable=True
    )

    answer = Column(
        Text,
        nullable=True
    )

    confidence = Column(
        Float,
        nullable=True
    )

    result_json = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )