from models import SecurityEvent, Alert, DetectionRule
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, SessionLocal
from models import SecurityEvent, Alert


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Custom SIEM API",
    description="Backend API for the custom SIEM project",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

@app.get("/detections")
def get_detection_rules(db: Session = Depends(get_db)):
    return (
        db.query(DetectionRule)
        .order_by(DetectionRule.id.asc())
        .all()
    )
@app.patch("/detections/{rule_id}/toggle")
def toggle_detection_rule(
    rule_id: int,
    db: Session = Depends(get_db)
):
    rule = (
        db.query(DetectionRule)
        .filter(DetectionRule.id == rule_id)
        .first()
    )

    if not rule:
        raise HTTPException(
            status_code=404,
            detail="Detection rule not found"
        )

    rule.enabled = (
        "false" if rule.enabled == "true" else "true"
    )

    db.commit()
    db.refresh(rule)

    return rule
