from database import SessionLocal
from models import SecurityEvent
from parser import parse_auth_log

LOG_FILE = "/var/log/auth.log"

def ingest_auth_logs():
  db = SessionLocal()

  try:
    with open(LOG_FILE, "r") as file:
      for line in file:
        event_data= parse_auth_log(line)

        if not event_data:
          continue

        event =  SecurityEvent(**event_data)

        db.add(event)
    db.commit()

  finally:
    db.close()

if __name__ == "__main__":
  ingest_auth_logs()
  print("Log ingestion complete.")
