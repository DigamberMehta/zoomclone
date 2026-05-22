from pydantic import BaseModel
from typing import Optional


# ── Meeting schemas ──────────────────────────────────────────────────────────

class MeetingBase(BaseModel):
    title: str
    description: Optional[str] = None
    host_name: str = "Digamber Mehta"
    duration: int = 60


class MeetingCreate(MeetingBase):
    """Used when creating an instant meeting."""
    pass


class MeetingSchedule(MeetingBase):
    """Used when scheduling a future meeting."""
    start_time: str  # ISO 8601 string from frontend


class MeetingOut(BaseModel):
    id: int
    meeting_id: str
    title: str
    description: Optional[str]
    host_name: str
    start_time: str
    duration: int
    status: str
    invite_link: Optional[str]
    created_at: str

    model_config = {"from_attributes": True}


# ── Participant schemas ──────────────────────────────────────────────────────

class ParticipantJoin(BaseModel):
    name: str


class ParticipantOut(BaseModel):
    id: int
    meeting_id: str
    name: str
    joined_at: str
    left_at: Optional[str]
    is_host: bool

    model_config = {"from_attributes": True}


# ── Generic response ─────────────────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str
