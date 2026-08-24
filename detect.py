from datetime import datetime, timedelta

from database import SessionLocal
from models import SecurityEvent, Alert, DetectionRule


def run_detection():
    db = SessionLocal()

    try:
        rules = (
            db.query(DetectionRule)
            .filter(DetectionRule.enabled == "true")
            .all()
        )

        total_alerts_created = 0

        for rule in rules:
            window_start = datetime.utcnow() - timedelta(
                minutes=rule.window_minutes
            )

            events = (
                db.query(SecurityEvent)
                .filter(
                    SecurityEvent.event_type == rule.event_type,
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

            for (host, username), matching_events in grouped.items():
                count = len(matching_events)

                if count < rule.threshold:
                    continue

                existing_alert = (
                    db.query(Alert)
                    .filter(
                        Alert.rule_name == rule.name,
                        Alert.host == host,
                        Alert.username == username,
                        Alert.status == "open"
                    )
                    .first()
                )

                if existing_alert:
                    continue

                alert = Alert(
                    rule_name=rule.name,
                    severity=rule.severity,
                    host=host,
                    username=username,
                    event_count=count,
                    status="open",
                    description=(
                        f"{count} {rule.event_type} events detected "
                        f"for {username} on {host} within "
                        f"{rule.window_minutes} minutes."
                    )
                )

                db.add(alert)
                total_alerts_created += 1

        db.commit()

        print(f"Created {total_alerts_created} alert(s).")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    run_detection()
