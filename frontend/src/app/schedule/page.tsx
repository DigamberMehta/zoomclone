"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Video, ArrowLeft, CalendarPlus, Check } from "lucide-react";
import { scheduleMeeting } from "@/lib/api";

export default function SchedulePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: "60",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    meeting_id: string;
    invite_link: string;
  } | null>(null);

  const set =
    (k: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!form.date || !form.time) {
      setError("Date and time are required");
      return;
    }

    const startTime = new Date(`${form.date}T${form.time}`).toISOString();
    setLoading(true);
    setError("");
    try {
      const meeting = await scheduleMeeting({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        host_name: "Digamber Mehta",
        start_time: startTime,
        duration: parseInt(form.duration),
      });
      setSuccess({
        meeting_id: meeting.meeting_id,
        invite_link: meeting.invite_link ?? "",
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to schedule meeting");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-[#1C1C1C] border border-[#2D2D2D] rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-white font-semibold text-xl mb-1">
              Meeting Scheduled!
            </h2>
            <p className="text-gray-400 text-sm mb-5">
              Your meeting has been created and is ready.
            </p>

            <div className="space-y-3 mb-6 text-left">
              <InfoRow label="Meeting ID" value={success.meeting_id} mono />
              <InfoRow
                label="Invite Link"
                value={success.invite_link}
                mono
                copyable
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push("/")}
                className="py-2.5 bg-[#0B5CFF] hover:bg-[#0950E8] text-white font-medium rounded-lg transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => {
                  setSuccess(null);
                  setForm({
                    title: "",
                    description: "",
                    date: "",
                    time: "",
                    duration: "60",
                  });
                }}
                className="py-2.5 border border-[#3A3A3A] text-gray-300 hover:text-white hover:border-gray-400 rounded-lg transition-colors text-sm"
              >
                Schedule Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="bg-[#1C1C1C] border border-[#2D2D2D] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#7B61FF]/20 rounded-xl flex items-center justify-center">
                <CalendarPlus className="w-5 h-5 text-[#7B61FF]" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  Schedule a Meeting
                </h1>
                <p className="text-gray-500 text-sm">
                  Fill in the details below
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Meeting Title *">
                <input
                  type="text"
                  value={form.title}
                  onChange={set("title")}
                  placeholder="e.g. Weekly Team Standup"
                  className={INPUT}
                  required
                />
              </Field>

              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={set("description")}
                  placeholder="Optional — agenda, notes, etc."
                  rows={3}
                  className={`${INPUT} resize-none`}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Date *">
                  <input
                    type="date"
                    value={form.date}
                    onChange={set("date")}
                    min={new Date().toISOString().split("T")[0]}
                    className={INPUT}
                    required
                  />
                </Field>
                <Field label="Time *">
                  <input
                    type="time"
                    value={form.time}
                    onChange={set("time")}
                    className={INPUT}
                    required
                  />
                </Field>
              </div>

              <Field label="Duration">
                <select
                  value={form.duration}
                  onChange={set("duration")}
                  className={INPUT}
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1 hour 30 minutes</option>
                  <option value="120">2 hours</option>
                </select>
              </Field>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#7B61FF] hover:bg-[#6A50EE] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {loading ? "Scheduling..." : "Schedule Meeting"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const INPUT =
  "w-full bg-[#2D2D2D] border border-[#3A3A3A] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#0B5CFF] transition-colors";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5 font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

function Header() {
  return (
    <header className="h-14 bg-[#1C1C1C] border-b border-[#2D2D2D] flex items-center px-6 gap-3">
      <div className="w-8 h-8 bg-[#0B5CFF] rounded flex items-center justify-center">
        <Video className="w-4 h-4 text-white" />
      </div>
      <span className="text-white font-semibold text-lg">Zoom</span>
    </header>
  );
}

function InfoRow({
  label,
  value,
  mono,
  copyable,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-[#2D2D2D] rounded-lg p-3">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <p
          className={`text-white text-sm flex-1 truncate ${mono ? "font-mono" : ""}`}
        >
          {value}
        </p>
        {copyable && (
          <button
            onClick={copy}
            className="text-xs text-gray-400 hover:text-white transition-colors shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}
