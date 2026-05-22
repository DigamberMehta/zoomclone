"""Seed the SQLite database with sample meetings and participants."""
from datetime import datetime, timezone, timedelta

from database import SessionLocal, engine
import models

models.Base.metadata.create_all(bind=engine)


def iso(dt: datetime) -> str:
    return dt.isoformat()


def main():
    db = SessionLocal()
    now = datetime.now(timezone.utc)

    # Clear existing data
    db.query(models.Participant).delete()
    db.query(models.Meeting).delete()
    db.commit()

    meetings = [
        # ── Upcoming ─────────────────────────────────────────────────────
        models.Meeting(
            meeting_id="123-4567-890",
            title="Weekly Team Standup",
            description="Daily sync with the engineering team",
            host_name="Digamber Mehta",
            start_time=iso(now + timedelta(hours=1)),
            duration=30,
            status="upcoming",
            invite_link="http://localhost:3000/join?meetingId=123-4567-890",
            created_at=iso(now - timedelta(days=1)),
        ),
        models.Meeting(
            meeting_id="234-5678-901",
            title="Product Demo — Q2 Release",
            description="Demo of new features shipping in Q2",
            host_name="Digamber Mehta",
            start_time=iso(now + timedelta(hours=3)),
            duration=60,
            status="upcoming",
            invite_link="http://localhost:3000/join?meetingId=234-5678-901",
            created_at=iso(now - timedelta(hours=5)),
        ),
        models.Meeting(
            meeting_id="345-6789-012",
            title="Design Review",
            description="Review updated Figma designs for mobile app",
            host_name="Digamber Mehta",
            start_time=iso(now + timedelta(days=1)),
            duration=45,
            status="upcoming",
            invite_link="http://localhost:3000/join?meetingId=345-6789-012",
            created_at=iso(now - timedelta(hours=2)),
        ),
        models.Meeting(
            meeting_id="456-7890-123",
            title="Client Onboarding — Acme Corp",
            description="Initial onboarding call with new enterprise client",
            host_name="Digamber Mehta",
            start_time=iso(now + timedelta(days=2)),
            duration=90,
            status="upcoming",
            invite_link="http://localhost:3000/join?meetingId=456-7890-123",
            created_at=iso(now - timedelta(hours=1)),
        ),
        # ── Recent / Ended ────────────────────────────────────────────────
        models.Meeting(
            meeting_id="567-8901-234",
            title="Sprint Planning — Sprint 14",
            description="Plan tasks for the upcoming sprint",
            host_name="Digamber Mehta",
            start_time=iso(now - timedelta(days=1)),
            duration=60,
            status="ended",
            invite_link="http://localhost:3000/join?meetingId=567-8901-234",
            created_at=iso(now - timedelta(days=2)),
        ),
        models.Meeting(
            meeting_id="678-9012-345",
            title="Retrospective — Sprint 13",
            description="What went well, what to improve",
            host_name="Digamber Mehta",
            start_time=iso(now - timedelta(days=3)),
            duration=45,
            status="ended",
            invite_link="http://localhost:3000/join?meetingId=678-9012-345",
            created_at=iso(now - timedelta(days=4)),
        ),
        models.Meeting(
            meeting_id="789-0123-456",
            title="Architecture Discussion",
            description="Discuss microservices migration strategy",
            host_name="Digamber Mehta",
            start_time=iso(now - timedelta(days=5)),
            duration=120,
            status="ended",
            invite_link="http://localhost:3000/join?meetingId=789-0123-456",
            created_at=iso(now - timedelta(days=6)),
        ),
        models.Meeting(
            meeting_id="890-1234-567",
            title="HR — Performance Reviews",
            description="Q1 performance review discussion",
            host_name="Digamber Mehta",
            start_time=iso(now - timedelta(days=7)),
            duration=30,
            status="ended",
            invite_link="http://localhost:3000/join?meetingId=890-1234-567",
            created_at=iso(now - timedelta(days=8)),
        ),
    ]

    db.add_all(meetings)
    db.commit()

    # Add participants for past meetings
    participants = [
        models.Participant(meeting_id="567-8901-234", name="Digamber Mehta", joined_at=iso(now - timedelta(days=1)), left_at=iso(now - timedelta(days=1, minutes=-60)), is_host=True),
        models.Participant(meeting_id="567-8901-234", name="Alice Smith", joined_at=iso(now - timedelta(days=1)), left_at=iso(now - timedelta(days=1, minutes=-58)), is_host=False),
        models.Participant(meeting_id="567-8901-234", name="Bob Johnson", joined_at=iso(now - timedelta(days=1)), left_at=iso(now - timedelta(days=1, minutes=-55)), is_host=False),
        models.Participant(meeting_id="678-9012-345", name="Digamber Mehta", joined_at=iso(now - timedelta(days=3)), left_at=iso(now - timedelta(days=3, minutes=-45)), is_host=True),
        models.Participant(meeting_id="678-9012-345", name="Carol White", joined_at=iso(now - timedelta(days=3)), left_at=iso(now - timedelta(days=3, minutes=-40)), is_host=False),
        models.Participant(meeting_id="789-0123-456", name="Digamber Mehta", joined_at=iso(now - timedelta(days=5)), left_at=iso(now - timedelta(days=5, minutes=-120)), is_host=True),
        models.Participant(meeting_id="789-0123-456", name="David Lee", joined_at=iso(now - timedelta(days=5)), left_at=iso(now - timedelta(days=5, minutes=-110)), is_host=False),
    ]

    db.add_all(participants)
    db.commit()
    db.close()

    print("✅  Database seeded successfully!")
    print(f"    → {len(meetings)} meetings")
    print(f"    → {len(participants)} participants")


if __name__ == "__main__":
    main()
