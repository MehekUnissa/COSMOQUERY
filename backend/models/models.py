from datetime import datetime

from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Float
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text

from .database import Base


class Analysis(Base):

    __tablename__ = "analyses"


    # -----------------------------------------------------
    # Primary key
    # -----------------------------------------------------

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    # -----------------------------------------------------
    # Images
    # -----------------------------------------------------

    primary_filename = Column(
        String(255),
        nullable=False
    )


    secondary_filename = Column(
        String(255),
        nullable=True
    )


    primary_path = Column(
        String(1000),
        nullable=False
    )


    secondary_path = Column(
        String(1000),
        nullable=True
    )


    # -----------------------------------------------------
    # Analysis
    # -----------------------------------------------------

    analysis_mode = Column(
        String(50),
        nullable=False
    )


    pipeline = Column(
        String(100),
        nullable=False
    )


    # -----------------------------------------------------
    # Status
    # -----------------------------------------------------

    status = Column(
        String(50),
        nullable=False,
        default="uploaded"
    )


    # -----------------------------------------------------
    # Result
    # -----------------------------------------------------

    confidence = Column(
        Float,
        nullable=False,
        default=0.0
    )


    result_text = Column(
        Text,
        nullable=True
    )


    # -----------------------------------------------------
    # Timestamp
    # -----------------------------------------------------

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )