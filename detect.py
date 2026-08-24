from datetime import datetime, timedelta

from database import SessionLocal
from models import SecurityEvent, Alert


RULE_NAME = "Multiple Failed Authentication Attempts"
THRESHOLD = 3
WINDOW_MINUTES = 15


def run_detection():
    db = SessionLocal()

    try:
        window_start = datetime.utcnow() - timedelta(
            minutes=WINDOW_MINUTES
        )

        events = (
            db.query(SecurityEvent)
            .filter(
                SecurityEvent.event_type == "authentication_failure",
                SecurityEvent.timestamp >= window_start
            )
            .all()
        )

        grouped = {}

        for event in events:
            key = (event.host, event.username)

            if key not in grouped:
                grouped[key] = []

            grouped[key].append(event)

        alerts_created = 0

        for (host, username), matching_events in grouped.items():
            count = len(matching_events)

            if count < THRESHOLD:
                continue

            existing_alert = (
                db.query(Alert)
                .filter(
                    Alert.rule_name == RULE_NAME,
                    Alert.host == host,
                    Alert.username == username,
                    Alert.status == "open"
                )
                .first()
            )

            if existing_alert:
                continue

            alert = Alert(
                rule_name=RULE_NAME,
                severity="medium",
                host=host,
                username=username,
                event_count=count,
                status="open",
                description=(
                    f"{count} authentication failures detected for "
                    f"{username} on {host} within "
                    f"{WINDOW_MINUTES} minutes."
                )
            )

            db.add(alert)
            alerts_created += 1

        db.commit()

        print(f"Created {alerts_created} alert(s).")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    run_detection()
