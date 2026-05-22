"use client";

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MessageSquare,
  Users,
  MoreHorizontal,
  PhoneOff,
  Hand,
  Smile,
  Shield,
} from "lucide-react";

interface Props {
  micOn: boolean;
  cameraOn: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onLeave: () => void;
  participantCount: number;
  onToggleParticipants: () => void;
  onToggleChat: () => void;
  showParticipants: boolean;
  showChat: boolean;
}

export default function MeetingControls({
  micOn,
  cameraOn,
  onToggleMic,
  onToggleCamera,
  onLeave,
  participantCount,
  onToggleParticipants,
  onToggleChat,
  showParticipants,
  showChat,
}: Props) {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-[#1C1C1C] border-t border-[#2D2D2D]">
      {/* Left — time */}
      <div className="w-40 hidden md:flex items-center gap-2 text-gray-400 text-sm">
        <span>
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <span className="text-gray-600">|</span>
        <Shield className="w-4 h-4 text-green-400" />
      </div>

      {/* Center — primary controls */}
      <div className="flex items-center gap-2">
        <ControlButton
          onClick={onToggleMic}
          active={micOn}
          icon={
            micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />
          }
          label={micOn ? "Mute" : "Unmute"}
          danger={!micOn}
        />
        <ControlButton
          onClick={onToggleCamera}
          active={cameraOn}
          icon={
            cameraOn ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5" />
            )
          }
          label={cameraOn ? "Stop Video" : "Start Video"}
          danger={!cameraOn}
        />

        <div className="w-px h-8 bg-[#3A3A3A] mx-1" />

        <ControlButton
          onClick={() => {}}
          active={false}
          icon={<MonitorUp className="w-5 h-5" />}
          label="Share Screen"
        />
        <ControlButton
          onClick={() => {}}
          active={false}
          icon={<Hand className="w-5 h-5" />}
          label="Reactions"
        />
        <ControlButton
          onClick={() => {}}
          active={false}
          icon={<Smile className="w-5 h-5" />}
          label="Reactions"
        />

        <div className="w-px h-8 bg-[#3A3A3A] mx-1" />

        <ControlButton
          onClick={onToggleParticipants}
          active={showParticipants}
          icon={<Users className="w-5 h-5" />}
          label={`${participantCount}`}
          badge={participantCount}
        />
        <ControlButton
          onClick={onToggleChat}
          active={showChat}
          icon={<MessageSquare className="w-5 h-5" />}
          label="Chat"
        />
        <ControlButton
          onClick={() => {}}
          active={false}
          icon={<MoreHorizontal className="w-5 h-5" />}
          label="More"
        />
      </div>

      {/* Right — leave */}
      <div className="w-40 flex justify-end">
        <button
          onClick={onLeave}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <PhoneOff className="w-4 h-4" />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>
    </div>
  );
}

function ControlButton({
  onClick,
  active,
  icon,
  label,
  danger = false,
  badge,
}: {
  onClick: () => void;
  active: boolean;
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs transition-colors
        ${active ? "text-white hover:bg-[#2D2D2D]" : danger ? "text-red-400 hover:bg-red-500/10" : "text-gray-400 hover:text-white hover:bg-[#2D2D2D]"}
      `}
    >
      {icon}
      <span className="hidden md:block">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#0B5CFF] rounded-full text-white text-[9px] flex items-center justify-center font-bold">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
}
