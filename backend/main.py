from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import engine, get_db
from utils import generate_meeting_id, now_iso, build_invite_link

# ── Bootstrap ────────────────────────────────────────────────────────────────
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ZoomClone API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Meetings ─────────────────────────────────────────────────────────────────

@app.get("/meetings", response_model=List[schemas.MeetingOut])
def list_meetings(db: Session = Depends(get_db)):
    """Return all meetings ordered by start_time descending."""
    return db.query(models.Meeting).order_by(models.Meeting.start_time.desc()).all()


@app.get("/meetings/upcoming", response_model=List[schemas.MeetingOut])
def upcoming_meetings(db: Session = Depends(get_db)):
    """Return meetings with status 'upcoming' or 'active'."""
    return (
        db.query(models.Meeting)
        .filter(models.Meeting.status.in_(["upcoming", "active"]))
        .order_by(models.Meeting.start_time.asc())
        .all()
    )


@app.get("/meetings/recent", response_model=List[schemas.MeetingOut])
def recent_meetings(db: Session = Depends(get_db)):
    """Return the 10 most recently ended meetings."""
    return (
        db.query(models.Meeting)
        .filter(models.Meeting.status == "ended")
        .order_by(models.Meeting.start_time.desc())
        .limit(10)
        .all()
    )


@app.post("/meetings", response_model=schemas.MeetingOut, status_code=status.HTTP_201_CREATED)
def create_instant_meeting(payload: schemas.MeetingCreate, db: Session = Depends(get_db)):
    """Create and immediately activate an instant meeting."""
    meeting_id = generate_meeting_id()
    invite_link = build_invite_link(meeting_id)
    meeting = models.Meeting(
        meeting_id=meeting_id,
        title=payload.title or "Instant Meeting",
        description=payload.description,
        host_name=payload.host_name,
        start_time=now_iso(),
        duration=payload.duration,
        status="active",
        invite_link=invite_link,
        created_at=now_iso(),
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    # Auto-add host as participant
    participant = models.Participant(
        meeting_id=meeting_id,
        name=payload.host_name,
        joined_at=now_iso(),
        is_host=True,
    )
    db.add(participant)
    db.commit()

    return meeting


@app.post("/meetings/schedule", response_model=schemas.MeetingOut, status_code=status.HTTP_201_CREATED)
def schedule_meeting(payload: schemas.MeetingSchedule, db: Session = Depends(get_db)):
    """Schedule a future meeting."""
    meeting_id = generate_meeting_id()
    invite_link = build_invite_link(meeting_id)
    meeting = models.Meeting(
        meeting_id=meeting_id,
        title=payload.title,
        description=payload.description,
        host_name=payload.host_name,
        start_time=payload.start_time,
        duration=payload.duration,
        status="upcoming",
        invite_link=invite_link,
        created_at=now_iso(),
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting


@app.get("/meetings/{meeting_id}", response_model=schemas.MeetingOut)
def get_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.meeting_id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


@app.post("/meetings/{meeting_id}/join", response_model=schemas.ParticipantOut, status_code=status.HTTP_201_CREATED)
def join_meeting(meeting_id: str, payload: schemas.ParticipantJoin, db: Session = Depends(get_db)):
    """Register a participant joining a meeting."""
    meeting = db.query(models.Meeting).filter(models.Meeting.meeting_id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if meeting.status == "ended":
        raise HTTPException(status_code=400, detail="Meeting has already ended")

    # Activate upcoming meetings when someone joins
    if meeting.status == "upcoming":
        meeting.status = "active"
        db.commit()

    participant = models.Participant(
        meeting_id=meeting_id,
        name=payload.name,
        joined_at=now_iso(),
        is_host=False,
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)
    return participant


@app.put("/meetings/{meeting_id}/end", response_model=schemas.MeetingOut)
def end_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.meeting_id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    meeting.status = "ended"
    db.commit()
    db.refresh(meeting)
    return meeting


@app.delete("/meetings/{meeting_id}", response_model=schemas.MessageResponse)
def delete_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.meeting_id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    db.delete(meeting)
    db.commit()
    return {"message": "Meeting deleted successfully"}


# ── Participants ──────────────────────────────────────────────────────────────

@app.get("/meetings/{meeting_id}/participants", response_model=List[schemas.ParticipantOut])
def list_participants(meeting_id: str, db: Session = Depends(get_db)):
    return (
        db.query(models.Participant)
        .filter(models.Participant.meeting_id == meeting_id, models.Participant.left_at.is_(None))
        .all()
    )


@app.put("/participants/{participant_id}/leave", response_model=schemas.ParticipantOut)
def leave_meeting(participant_id: int, db: Session = Depends(get_db)):
    participant = db.query(models.Participant).filter(models.Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    participant.left_at = now_iso()
    db.commit()
    db.refresh(participant)
    return participant


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "ZoomClone API"}
