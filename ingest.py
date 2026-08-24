from database import SessionLocal
from models import SecurityEvent
from parser import parse_auth_log

LOG_FILE = "/var/log/auth.log"


def ingest_auth_logs():
    db = SessionLocal()

    ingested = 0
    skipped = 0

    try:
        with open(LOG_FILE, "r", errors="replace") as file:
            for line in file:
                event_data = parse_auth_log(line)

                if not event_data:
                    continue

                # raw_log identifies the original log entry.
                existing = (
                    db.query(SecurityEvent)
                    .filter(
                        SecurityEvent.raw_log == event_data["raw_log"]
                    )
                    .first()
                )

                if existing:
                    skipped += 1
                    continue

                event = SecurityEvent(**event_data)

                db.add(event)
                ingested += 1

        db.commit()

        print(f"Ingested: {ingested}")
        print(f"Duplicates skipped: {skipped}")
        print("Log ingestion complete.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    ingest_auth_logs()
