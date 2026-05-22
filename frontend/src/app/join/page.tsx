"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Video, ArrowLeft, LogIn } from "lucide-react";
import { getMeeting, joinMeeting } from "@/lib/api";

function JoinForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [meetingId, setMeetingId] = useState(params.get("meetingId") ?? "");
  const [name, setName] = useState("Digamber Mehta");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = meetingId.trim();
    const cleanName = name.trim();
    if (!cleanId) {
      setError("Please enter a meeting ID");
      return;
    }
    if (!cleanName) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await getMeeting(cleanId); // validate existence
      await joinMeeting(cleanId, cleanName);
      router.push(`/meeting/${cleanId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not join meeting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col">
      {/* Top bar */}
      <header className="h-14 bg-[#1C1C1C] border-b border-[#2D2D2D] flex items-center px-6 gap-3">
        <div className="w-8 h-8 bg-[#0B5CFF] rounded flex items-center justify-center">
          <Video className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-semibold text-lg">Zoom</span>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="bg-[#1C1C1C] border border-[#2D2D2D] rounded-2xl p-8">
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 bg-[#0B5CFF]/20 rounded-full flex items-center justify-center mb-3">
                <LogIn className="w-7 h-7 text-[#0B5CFF]" />
              </div>
              <h1 className="text-xl font-semibold text-white">
                Join a Meeting
              </h1>
              <p className="text-gray-500 text-sm text-center mt-1">
                Enter the meeting ID and your display name
              </p>
            </div>

            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                  Meeting ID
                </label>
                <input
                  type="text"
                  value={meetingId}
                  onChange={(e) => setMeetingId(e.target.value)}
                  placeholder="e.g. 123-4567-890"
                  className="w-full bg-[#2D2D2D] border border-[#3A3A3A] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#0B5CFF] transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Display name"
                  className="w-full bg-[#2D2D2D] border border-[#3A3A3A] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#0B5CFF] transition-colors"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#0B5CFF] hover:bg-[#0950E8] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {loading ? "Joining..." : "Join Meeting"}
              </button>
            </form>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don&apos;t have a meeting?{" "}
            <Link href="/" className="text-[#0B5CFF] hover:underline">
              Start one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense>
      <JoinForm />
    </Suspense>
  );
}
