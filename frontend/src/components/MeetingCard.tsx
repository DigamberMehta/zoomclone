"use client";

import { format, parseISO, isToday, isTomorrow } from "date-fns";
import { Clock, Users, MoreVertical, Video, Link2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Meeting, deleteMeeting } from "@/lib/api";

interface Props {
  meeting: Meeting;
  onDeleted?: (id: string) => void;
  onJoin?: (id: string) => void;
}

function formatStartTime(iso: string): string {
  const dt = parseISO(iso);
  const timePart = format(dt, "h:mm a");
  if (isToday(dt)) return `Today, ${timePart}`;
  if (isTomorrow(dt)) return `Tomorrow, ${timePart}`;
  return format(dt, "EEE, MMM d · h:mm a");
}

const STATUS_COLORS: Record<string, string> = {
  upcoming: "bg-blue-500/20 text-blue-400",
  active: "bg-green-500/20 text-green-400",
  ended: "bg-gray-500/20 text-gray-400",
};

export default function MeetingCard({ meeting, onDeleted, onJoin }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (meeting.invite_link) {
      navigator.clipboard.writeText(meeting.invite_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setMenuOpen(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${meeting.title}"?`)) return;
    await deleteMeeting(meeting.meeting_id);
    onDeleted?.(meeting.meeting_id);
    setMenuOpen(false);
  };

  return (
    <div className="group relative flex items-center gap-4 bg-[#2A2A2A] hover:bg-[#323232] border border-[#3A3A3A] rounded-xl px-5 py-4 transition-colors">
      {/* Icon */}
      <div className="w-10 h-10 rounded-full bg-[#0B5CFF]/20 flex items-center justify-center shrink-0">
        <Video className="w-5 h-5 text-[#0B5CFF]" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-white font-medium text-sm truncate">
            {meeting.title}
          </p>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[meeting.status]}`}
          >
            {meeting.status}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-gray-400 text-xs">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatStartTime(meeting.start_time)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {meeting.duration} min
          </span>
          <span className="font-mono text-gray-500">{meeting.meeting_id}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {meeting.status !== "ended" && (
          <button
            onClick={() => onJoin?.(meeting.meeting_id)}
            className="px-4 py-1.5 bg-[#0B5CFF] hover:bg-[#0950E8] text-white text-sm font-medium rounded-lg transition-colors"
          >
            {meeting.status === "active" ? "Join" : "Start"}
          </button>
        )}

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#3A3A3A] rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-9 z-20 w-44 bg-[#2D2D2D] border border-[#3A3A3A] rounded-xl shadow-xl overflow-hidden">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-[#3A3A3A] hover:text-white transition-colors"
                >
                  <Link2 className="w-4 h-4" />
                  {copied ? "Copied!" : "Copy invite link"}
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete meeting
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
