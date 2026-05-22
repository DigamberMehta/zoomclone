"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Video,
  Users,
  CalendarPlus,
  Monitor,
  Clock,
  ChevronRight,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import MeetingCard from "@/components/MeetingCard";
import NewMeetingModal from "@/components/NewMeetingModal";
import { Meeting, getUpcomingMeetings, getRecentMeetings } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [upcoming, setUpcoming] = useState<Meeting[]>([]);
  const [recent, setRecent] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewMeeting, setShowNewMeeting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([
        getUpcomingMeetings(),
        getRecentMeetings(),
      ]);
      setUpcoming(u);
      setRecent(r);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDeleted = (id: string) => {
    setUpcoming((prev) => prev.filter((m) => m.meeting_id !== id));
    setRecent((prev) => prev.filter((m) => m.meeting_id !== id));
  };

  const handleJoin = (id: string) => router.push(`/meeting/${id}`);

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#111111]">
      <Navbar />
      <main className="pt-14 flex">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 fixed left-0 top-14 bottom-0 bg-[#1C1C1C] border-r border-[#2D2D2D] flex-col py-4 overflow-y-auto hidden md:flex">
          <nav className="flex flex-col gap-1 px-3">
            <SidebarItem icon={<Clock />} label="Home" active />
            <SidebarItem icon={<Video />} label="Meetings" href="/schedule" />
            <SidebarItem icon={<Users />} label="Contacts" />
            <SidebarItem icon={<Monitor />} label="Whiteboard" />
          </nav>
          <div className="mt-auto px-4 py-3 text-xs text-gray-500">
            <p className="font-medium text-gray-400">Digamber Mehta</p>
            <p>Free Plan</p>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 md:ml-56 px-6 py-6 max-w-5xl">
          <div className="mb-8">
            <p className="text-5xl font-light text-white">{timeStr}</p>
            <p className="text-gray-400 mt-1">{dateStr}</p>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            <ActionCard
              icon={<Video className="w-6 h-6" />}
              label="New Meeting"
              description="Start an instant meeting"
              color="bg-[#FF6B35]"
              onClick={() => setShowNewMeeting(true)}
            />
            <ActionCard
              icon={<ArrowRight className="w-6 h-6" />}
              label="Join"
              description="Join with a meeting ID"
              color="bg-[#0B5CFF]"
              href="/join"
            />
            <ActionCard
              icon={<CalendarPlus className="w-6 h-6" />}
              label="Schedule"
              description="Plan a future meeting"
              color="bg-[#7B61FF]"
              href="/schedule"
            />
            <ActionCard
              icon={<Monitor className="w-6 h-6" />}
              label="Share Screen"
              description="Share your screen"
              color="bg-[#00C49A]"
              onClick={() => {}}
            />
          </div>

          <Section
            title="Upcoming"
            count={upcoming.length}
            onRefresh={load}
            loading={loading}
          >
            {upcoming.length === 0 && !loading ? (
              <EmptyState
                icon={<CalendarPlus className="w-8 h-8 text-gray-500" />}
                message="No upcoming meetings"
                action={
                  <Link
                    href="/schedule"
                    className="text-[#0B5CFF] hover:underline text-sm"
                  >
                    Schedule one
                  </Link>
                }
              />
            ) : (
              upcoming.map((m) => (
                <MeetingCard
                  key={m.meeting_id}
                  meeting={m}
                  onDeleted={handleDeleted}
                  onJoin={handleJoin}
                />
              ))
            )}
          </Section>

          <Section
            title="Recent"
            count={recent.length}
            loading={loading}
            className="mt-8"
          >
            {recent.length === 0 && !loading ? (
              <EmptyState
                icon={<Clock className="w-8 h-8 text-gray-500" />}
                message="No recent meetings"
              />
            ) : (
              recent.map((m) => (
                <MeetingCard
                  key={m.meeting_id}
                  meeting={m}
                  onDeleted={handleDeleted}
                  onJoin={handleJoin}
                />
              ))
            )}
          </Section>
        </div>
      </main>

      {showNewMeeting && (
        <NewMeetingModal
          onClose={() => {
            setShowNewMeeting(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function ActionCard({
  icon,
  label,
  description,
  color,
  onClick,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  onClick?: () => void;
  href?: string;
}) {
  const inner = (
    <div className="bg-[#1C1C1C] hover:bg-[#242424] border border-[#2D2D2D] rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-colors group">
      <div
        className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white`}
      >
        {icon}
      </div>
      <div>
        <p className="text-white font-semibold text-sm">{label}</p>
        <p className="text-gray-500 text-xs mt-0.5">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors ml-auto" />
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return <div onClick={onClick}>{inner}</div>;
}

function Section({
  title,
  count,
  onRefresh,
  loading,
  children,
  className = "",
}: {
  title: string;
  count: number;
  onRefresh?: () => void;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-white font-semibold">{title}</h2>
          {count > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#2D2D2D] text-gray-400 text-xs flex items-center justify-center">
              {count}
            </span>
          )}
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="text-gray-500 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {loading
          ? Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-16 bg-[#1C1C1C] rounded-xl animate-pulse"
              />
            ))
          : children}
      </div>
    </section>
  );
}

function SidebarItem({
  icon,
  label,
  active,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  href?: string;
}) {
  const cls = `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${active ? "bg-[#0B5CFF]/10 text-[#0B5CFF]" : "text-gray-400 hover:bg-[#2D2D2D] hover:text-white"}`;
  if (href)
    return (
      <Link href={href} className={cls}>
        <span className="w-4 h-4">{icon}</span>
        {label}
      </Link>
    );
  return (
    <div className={cls}>
      <span className="w-4 h-4">{icon}</span>
      {label}
    </div>
  );
}

function EmptyState({
  icon,
  message,
  action,
}: {
  icon: React.ReactNode;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon}
      <p className="text-gray-500 text-sm mt-3">{message}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
