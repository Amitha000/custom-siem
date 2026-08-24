from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from database import Base, engine, SessionLocal
from models import SecurityEvent

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Custom SIEM API")

def get_db():
  db =  SessionLocal()

  try:
    yield db
  finally:
    db.close()

@app.get("/")
def root():
  return {
    "service" : "Custom SIEM",
    "status" : "running"
  }

@app.get("/events")
def get_events(db: Session = Depends(get_db)):
  return db.query(SecurityEvent).all()

