from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from database import Base, engine, SessionLocal
from models import SecurityEvent, Alert


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Custom SIEM API",
    description="Backend API for the custom SIEM project",
    version="1.0.0"
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "service": "Custom SIEM",
        "status": "running"
    }


@app.get("/events")
def get_events(db: Session = Depends(get_db)):
    events = (
        db.query(SecurityEvent)
        .order_by(SecurityEvent.timestamp.desc())
        .all()
    )

    return events


@app.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    alerts = (
        db.query(Alert)
        .order_by(Alert.created_at.desc())
        .all()
    )

    return alerts
