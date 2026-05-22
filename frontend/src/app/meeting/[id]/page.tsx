"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Video,
  VideoOff,
  MicOff,
  Users,
  X,
  Send,
  Copy,
  Check,
  Crown,
} from "lucide-react";
import MeetingControls from "@/components/MeetingControls";
import {
  Meeting,
  Participant,
  getMeeting,
  getParticipants,
  endMeeting,
  leaveParticipant,
} from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface VideoTile {
  id: string;
  name: string;
  isHost: boolean;
  isSelf: boolean;
  micOn: boolean;
  cameraOn: boolean;
  stream?: MediaStream;
}

interface ChatMsg {
  id: string;
  sender: string;
  text: string;
  time: string;
}

// ── Meeting Room ──────────────────────────────────────────────────────────────

export default function MeetingRoomPage() {
  const { id: meetingId } = useParams<{ id: string }>();
  const router = useRouter();

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Controls
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: "1", sender: "System", text: "Welcome to the meeting!", time: now() },
  ]);
  const [copied, setCopied] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const participantIdRef = useRef<number | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // ── Load meeting data ───────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      const [m, p] = await Promise.all([
        getMeeting(meetingId),
        getParticipants(meetingId),
      ]);
      setMeeting(m);
      setParticipants(p);
    } catch {
      setError("Meeting not found or has ended.");
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [loadData]);

  // ── Camera stream ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!cameraOn) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: micOn })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        // Permission denied — UI shows muted/no-camera state gracefully
        setCameraOn(false);
      });
  }, [cameraOn]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ── Chat scroll ─────────────────────────────────────────────────────────────

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleLeave = async () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (participantIdRef.current) {
      await leaveParticipant(participantIdRef.current).catch(() => {});
    }
    router.push("/");
  };

  const handleEndMeeting = async () => {
    if (!confirm("End meeting for everyone?")) return;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    await endMeeting(meetingId);
    router.push("/");
  };

  const sendMessage = () => {
    const text = chatInput.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "Digamber Mehta",
        text,
        time: now(),
      },
    ]);
    setChatInput("");
  };

  const copyLink = () => {
    if (meeting?.invite_link) {
      navigator.clipboard.writeText(meeting.invite_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Build mock tiles for the grid ──────────────────────────────────────────

  const tiles: VideoTile[] = [
    {
      id: "self",
      name: "Digamber Mehta (You)",
      isHost: true,
      isSelf: true,
      micOn,
      cameraOn,
    },
    ...participants
      .filter((p) => !p.is_host)
      .slice(0, 8)
      .map((p) => ({
        id: String(p.id),
        name: p.name,
        isHost: p.is_host,
        isSelf: false,
        micOn: Math.random() > 0.3,
        cameraOn: Math.random() > 0.4,
      })),
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) return <LoadingScreen />;
  if (error)
    return <ErrorScreen message={error} onBack={() => router.push("/")} />;

  const gridCols =
    tiles.length === 1
      ? "grid-cols-1"
      : tiles.length <= 2
        ? "grid-cols-2"
        : tiles.length <= 4
          ? "grid-cols-2"
          : "grid-cols-3";

  return (
    <div className="h-screen flex flex-col bg-[#111111] overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1C1C1C] border-b border-[#2D2D2D] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white text-sm font-medium">
            {meeting?.title}
          </span>
          <span className="text-gray-500 text-xs font-mono">{meetingId}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2 py-1 rounded transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied" : "Copy Link"}
          </button>
          <button
            onClick={handleEndMeeting}
            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded transition-colors hidden sm:block"
          >
            End for All
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video grid */}
        <div className="flex-1 p-3 overflow-auto">
          <div className={`grid ${gridCols} gap-2 h-full`}>
            {tiles.map((tile) => (
              <VideoTileCard
                key={tile.id}
                tile={tile}
                videoRef={tile.isSelf ? videoRef : undefined}
              />
            ))}
          </div>
        </div>

        {/* Side panel */}
        {(showParticipants || showChat) && (
          <aside className="w-72 bg-[#1C1C1C] border-l border-[#2D2D2D] flex flex-col shrink-0">
            {/* Panel tabs */}
            <div className="flex border-b border-[#2D2D2D] shrink-0">
              {showParticipants && (
                <button className="flex-1 py-3 text-sm text-white font-medium border-b-2 border-[#0B5CFF]">
                  Participants ({participants.length + 1})
                </button>
              )}
              {showChat && (
                <button className="flex-1 py-3 text-sm text-white font-medium border-b-2 border-[#0B5CFF]">
                  Chat
                </button>
              )}
              <button
                onClick={() => {
                  setShowParticipants(false);
                  setShowChat(false);
                }}
                className="px-3 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {showParticipants && (
              <ParticipantsPanel participants={participants} />
            )}

            {showChat && !showParticipants && (
              <ChatPanel
                messages={messages}
                input={chatInput}
                onInputChange={setChatInput}
                onSend={sendMessage}
                bottomRef={chatBottomRef}
              />
            )}
          </aside>
        )}
      </div>

      {/* Controls bar */}
      <MeetingControls
        micOn={micOn}
        cameraOn={cameraOn}
        onToggleMic={() => setMicOn((v) => !v)}
        onToggleCamera={() => setCameraOn((v) => !v)}
        onLeave={handleLeave}
        participantCount={participants.length + 1}
        onToggleParticipants={() => {
          setShowParticipants((v) => !v);
          setShowChat(false);
        }}
        onToggleChat={() => {
          setShowChat((v) => !v);
          setShowParticipants(false);
        }}
        showParticipants={showParticipants}
        showChat={showChat}
      />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function VideoTileCard({
  tile,
  videoRef,
}: {
  tile: VideoTile;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}) {
  const initials = tile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const COLORS = [
    "#0B5CFF",
    "#7B61FF",
    "#FF6B35",
    "#00C49A",
    "#FF3B5C",
    "#FF9500",
  ];
  const color = COLORS[tile.name.charCodeAt(0) % COLORS.length];

  return (
    <div className="relative rounded-xl overflow-hidden bg-[#1E1E1E] flex items-center justify-center aspect-video">
      {tile.isSelf && tile.cameraOn ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover scale-x-[-1]"
        />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-xl"
            style={{ backgroundColor: color }}
          >
            {initials}
          </div>
          {!tile.cameraOn && (
            <span className="text-gray-500 text-xs flex items-center gap-1">
              <VideoOff className="w-3.5 h-3.5" /> Camera off
            </span>
          )}
        </div>
      )}

      {/* Name badge */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 rounded-md px-2 py-1">
        {tile.isHost && <Crown className="w-3 h-3 text-yellow-400" />}
        <span className="text-white text-xs">
          {tile.isSelf ? "You" : tile.name}
        </span>
        {!tile.micOn && <MicOff className="w-3 h-3 text-red-400" />}
      </div>
    </div>
  );
}

function ParticipantsPanel({ participants }: { participants: Participant[] }) {
  const COLORS = ["#0B5CFF", "#7B61FF", "#FF6B35", "#00C49A", "#FF3B5C"];
  return (
    <div className="flex-1 overflow-y-auto p-3">
      {/* Host (self) */}
      <ParticipantRow
        name="Digamber Mehta (You)"
        isHost
        initials="DM"
        color="#0B5CFF"
      />
      {participants.map((p) => {
        const inits = p.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        const color = COLORS[p.name.charCodeAt(0) % COLORS.length];
        return (
          <ParticipantRow
            key={p.id}
            name={p.name}
            isHost={p.is_host}
            initials={inits}
            color={color}
          />
        );
      })}
    </div>
  );
}

function ParticipantRow({
  name,
  isHost,
  initials,
  color,
}: {
  name: string;
  isHost: boolean;
  initials: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-[#2D2D2D] group transition-colors">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0"
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{name}</p>
        {isHost && <p className="text-xs text-gray-500">Host</p>}
      </div>
      <Users className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

function ChatPanel({
  messages,
  input,
  onInputChange,
  onSend,
  bottomRef,
}: {
  messages: ChatMsg[];
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m) => (
          <div key={m.id}>
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-medium text-[#0B5CFF]">
                {m.sender}
              </span>
              <span className="text-xs text-gray-600">{m.time}</span>
            </div>
            <p className="text-sm text-gray-300 mt-0.5">{m.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 p-3 border-t border-[#2D2D2D] shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder="Type a message…"
          className="flex-1 bg-[#2D2D2D] border border-[#3A3A3A] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#0B5CFF] transition-colors"
        />
        <button
          onClick={onSend}
          disabled={!input.trim()}
          className="w-8 h-8 flex items-center justify-center bg-[#0B5CFF] rounded-lg text-white disabled:opacity-40 transition-opacity"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}

function LoadingScreen() {
  return (
    <div className="h-screen bg-[#111111] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-full border-4 border-[#0B5CFF] border-t-transparent animate-spin mb-4" />
        <p className="text-white">Joining meeting…</p>
      </div>
    </div>
  );
}

function ErrorScreen({
  message,
  onBack,
}: {
  message: string;
  onBack: () => void;
}) {
  return (
    <div className="h-screen bg-[#111111] flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-4">{message}</p>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-[#0B5CFF] text-white rounded-lg"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

function now() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
