import random
import string
from datetime import datetime, timezone


def generate_meeting_id() -> str:
    """Generate a unique 9-digit meeting ID formatted as XXX-XXXX-XXX."""
    digits = "".join(random.choices(string.digits, k=9))
    return f"{digits[:3]}-{digits[3:7]}-{digits[7:]}"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def build_invite_link(meeting_id: str, base_url: str = "http://localhost:3000") -> str:
    return f"{base_url}/join?meetingId={meeting_id}"
