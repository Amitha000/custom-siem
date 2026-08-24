from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime

from database import Base


class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    host = Column(String, index=True)
    source = Column(String)
    event_type = Column(String, index=True)

    username = Column(String, nullable=True)
    process = Column(String, nullable=True)

    severity = Column(String, default="low")
    raw_log = Column(Text)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    rule_name = Column(String, index=True)
    severity = Column(String)

    host = Column(String, nullable=True)
    username = Column(String, nullable=True)

    event_count = Column(Integer)
    status = Column(String, default="open")
    description = Column(Text)
