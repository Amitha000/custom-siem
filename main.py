from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import Base, engine, SessionLocal
from models import SecurityEvent, Alert, DetectionRule


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


class DetectionRuleUpdate(BaseModel):
    severity: str
    threshold: int
    window_minutes: int


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
    return (
        db.query(SecurityEvent)
        .order_by(SecurityEvent.timestamp.desc())
        .all()
    )


@app.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    return (
        db.query(Alert)
        .order_by(Alert.created_at.desc())
        .all()
    )


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
        "false"
        if rule.enabled == "true"
        else "true"
    )

    db.commit()
    db.refresh(rule)

    return rule


@app.patch("/detections/{rule_id}")
def update_detection_rule(
    rule_id: int,
    update: DetectionRuleUpdate,
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

    if update.threshold < 1:
        raise HTTPException(
            status_code=400,
            detail="Threshold must be at least 1"
        )

    if update.window_minutes < 1:
        raise HTTPException(
            status_code=400,
            detail="Time window must be at least 1 minute"
        )

    allowed_severities = {
        "low",
        "medium",
        "high",
        "critical"
    }

    if update.severity not in allowed_severities:
        raise HTTPException(
            status_code=400,
            detail="Invalid severity"
        )

    rule.severity = update.severity
    rule.threshold = update.threshold
    rule.window_minutes = update.window_minutes

    db.commit()
    db.refresh(rule)

    return rule
