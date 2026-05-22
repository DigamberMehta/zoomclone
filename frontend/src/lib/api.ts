const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Meeting {
  id: number;
  meeting_id: string;
  title: string;
  description: string | null;
  host_name: string;
  start_time: string;
  duration: number;
  status: "upcoming" | "active" | "ended";
  invite_link: string | null;
  created_at: string;
}

export interface Participant {
  id: number;
  meeting_id: string;
  name: string;
  joined_at: string;
  left_at: string | null;
  is_host: boolean;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json();
}

// ── Meetings ────────────────────────────────────────────────────────────────

export const getUpcomingMeetings = () =>
  apiFetch<Meeting[]>("/meetings/upcoming");

export const getRecentMeetings = () => apiFetch<Meeting[]>("/meetings/recent");

export const getMeeting = (meetingId: string) =>
  apiFetch<Meeting>(`/meetings/${meetingId}`);

export const createInstantMeeting = (data: {
  title: string;
  host_name: string;
  duration?: number;
  description?: string;
}) =>
  apiFetch<Meeting>("/meetings", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const scheduleMeeting = (data: {
  title: string;
  description?: string;
  host_name: string;
  start_time: string;
  duration: number;
}) =>
  apiFetch<Meeting>("/meetings/schedule", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const endMeeting = (meetingId: string) =>
  apiFetch<Meeting>(`/meetings/${meetingId}/end`, { method: "PUT" });

export const deleteMeeting = (meetingId: string) =>
  apiFetch<{ message: string }>(`/meetings/${meetingId}`, {
    method: "DELETE",
  });

// ── Participants ─────────────────────────────────────────────────────────────

export const joinMeeting = (meetingId: string, name: string) =>
  apiFetch<Participant>(`/meetings/${meetingId}/join`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });

export const getParticipants = (meetingId: string) =>
  apiFetch<Participant[]>(`/meetings/${meetingId}/participants`);

export const leaveParticipant = (participantId: number) =>
  apiFetch<Participant>(`/participants/${participantId}/leave`, {
    method: "PUT",
  });
