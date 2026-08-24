from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime

from database import Base

class SecurityEvent(Base):
  __tablename__ = "security_events"
  
  id = Column(Integer, primary_key=True, index=True)
  timestamp = Column(DateTime, default = datetime.utcnow)

  host = Column(String, index=True)
  source = Column(String)
  event_type = Column(String, index=True)

  username= Column(String, nullable=True)
  process = Column(String, nullable=True)

  severity= Column(String, default="low")

  raw_log = Column(Text)

