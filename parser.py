from datetime import datetime

def parse_auth_log(line: str):
  if "authentication failure" not in line:
    return None
 
  parts = line.split()

  if len(parts) < 5:
    return None
  
  month = parts[0]
  day = parts[1]
  time_value = parts[2]
  host = parts[3]
  process = parts[4].rstrip(":")

  username = "unknown"

  for part in parts:
    if part.startswith("user="):
      username = part.split("=" , 1)[1]

  timestamp = datetime.strptime(
    f"{datetime.now().year} {month} {day} {time_value}",
    "%Y %b %d %H:%M:%S"
  )
 
  return {
    "timestamp" : timestamp,
    "host" : host,
    "source" : "linux_auth",
    "event_type" : "authentication_failure",
    "username" : username,
    "process" : process,
    "severity" : "low",
    "raw_log" : line.strip()
  }

 

