"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Video, Copy, Check } from "lucide-react";
import { createInstantMeeting } from "@/lib/api";

interface Props {
  onClose: () => void;
}

export default function NewMeetingModal({ onClose }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("Instant Meeting");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{
    meeting_id: string;
    invite_link: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    try {
      const meeting = await createInstantMeeting({
        title: title.trim() || "Instant Meeting",
        host_name: "Digamber Mehta",
        duration: 60,
      });
      setCreated({
        meeting_id: meeting.meeting_id,
        invite_link: meeting.invite_link ?? "",
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    if (created) router.push(`/meeting/${created.meeting_id}`);
  };

  const handleCopy = () => {
    if (created?.invite_link) {
      navigator.clipboard.writeText(created.invite_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1C1C1C] border border-[#3A3A3A] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D2D2D]">
          <h2 className="text-white font-semibold text-base">New Meeting</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {!created ? (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-[#0B5CFF]/20 flex items-center justify-center">
                <Video className="w-8 h-8 text-[#0B5CFF]" />
              </div>
              <p className="text-center text-gray-400 text-sm">
                Start an instant meeting. A unique link will be generated.
              </p>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                  Meeting title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#2D2D2D] border border-[#3A3A3A] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#0B5CFF] transition-colors"
                  placeholder="Meeting title"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full py-2.5 bg-[#0B5CFF] hover:bg-[#0950E8] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {loading ? "Creating..." : "Start Meeting"}
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-center text-white font-medium">
                Meeting Created!
              </p>

              <div className="bg-[#2D2D2D] rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Meeting ID</p>
                <p className="text-white font-mono font-semibold">
                  {created.meeting_id}
                </p>
              </div>

              <div className="bg-[#2D2D2D] rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Invite Link</p>
                <div className="flex items-center gap-2">
                  <p className="text-blue-400 text-xs font-mono truncate flex-1">
                    {created.invite_link}
                  </p>
                  <button
                    onClick={handleCopy}
                    className="text-gray-400 hover:text-white transition-colors shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handleJoin}
                className="w-full py-2.5 bg-[#0B5CFF] hover:bg-[#0950E8] text-white font-medium rounded-lg transition-colors"
              >
                Join Meeting Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
