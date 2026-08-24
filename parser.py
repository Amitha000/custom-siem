from datetime import datetime


def get_base_event(line: str):
    parts = line.split()

    if len(parts) < 5:
        return None

    try:
        timestamp = datetime.strptime(
            f"{datetime.now().year} {parts[0]} {parts[1]} {parts[2]}",
            "%Y %b %d %H:%M:%S"
        )
    except ValueError:
        return None

    return {
        "timestamp": timestamp,
        "host": parts[3],
        "source": "linux_auth",
        "username": "unknown",
        "process": parts[4].rstrip(":"),
        "severity": "low",
        "raw_log": line.strip()
    }


def extract_username(line: str):
    parts = line.split()

    # Prefer user= over ruser=
    for part in parts:
        if part.startswith("user="):
            return part.split("=", 1)[1]

    # sudo command logs often look like:
    # vboxuser : TTY=pts/0 ; PWD=...
    if "sudo:" in line:
        try:
            after_sudo = line.split("sudo:", 1)[1].strip()
            possible_user = after_sudo.split()[0]

            if possible_user not in {
                "pam_unix(sudo:auth):",
                "pam_unix(sudo:session):"
            }:
                return possible_user
        except (IndexError, ValueError):
            pass

    return "unknown"


def parse_auth_log(line: str):
    event = get_base_event(line)

    if not event:
        return None

    event["username"] = extract_username(line)

    # Failed authentication
    if "authentication failure" in line:
        event["event_type"] = "authentication_failure"
        event["severity"] = "low"
        return event

    # sudo command execution
    if "sudo:" in line and "COMMAND=" in line:
        event["event_type"] = "sudo_command"
        event["severity"] = "medium"
        return event

    # PAM session opened
    if "session opened" in line:
        event["event_type"] = "session_opened"
        event["severity"] = "low"
        return event

    # PAM session closed
    if "session closed" in line:
        event["event_type"] = "session_closed"
        event["severity"] = "low"
        return event

    # Successful SSH authentication
    if "Accepted password" in line or "Accepted publickey" in line:
        event["event_type"] = "successful_login"
        event["severity"] = "low"
        return event

    return None
