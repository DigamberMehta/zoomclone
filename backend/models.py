from sqlalchemy import Column, Integer, String, Boolean, Text
from database import Base


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(String(20), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    host_name = Column(String(100), nullable=False, default="Digamber Mehta")
    start_time = Column(String(50), nullable=False)
    duration = Column(Integer, nullable=False, default=60)  # minutes
    status = Column(String(20), nullable=False, default="upcoming")  # upcoming|active|ended
    invite_link = Column(String(500), nullable=True)
    created_at = Column(String(50), nullable=False)


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(String(20), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    joined_at = Column(String(50), nullable=False)
    left_at = Column(String(50), nullable=True)
    is_host = Column(Boolean, default=False)
