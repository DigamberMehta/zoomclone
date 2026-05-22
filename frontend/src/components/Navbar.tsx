"use client";

import Link from "next/link";
import { useState } from "react";
import { Video, Search, Bell, ChevronDown, Grid3X3 } from "lucide-react";

const DEFAULT_USER = { name: "Digamber Mehta", initials: "DM" };

export default function Navbar() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#1C1C1C] border-b border-[#2D2D2D] flex items-center px-4 gap-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 bg-[#0B5CFF] rounded flex items-center justify-center">
          <Video className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">
          Zoom
        </span>
      </Link>

      {/* Search */}
      <div
        className={`flex-1 max-w-sm mx-4 flex items-center gap-2 bg-[#2D2D2D] rounded-md px-3 h-8 transition-all ${
          searchFocused ? "ring-1 ring-[#0B5CFF]" : ""
        }`}
      >
        <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="bg-transparent text-sm text-white placeholder-gray-400 outline-none w-full"
        />
      </div>

      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2D2D2D] rounded-full transition-colors">
          <Grid3X3 className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2D2D2D] rounded-full transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Avatar */}
        <button className="flex items-center gap-1.5 hover:bg-[#2D2D2D] rounded-full pl-1 pr-2 py-0.5 transition-colors">
          <div className="w-7 h-7 rounded-full bg-[#0B5CFF] flex items-center justify-center text-white text-xs font-semibold">
            {DEFAULT_USER.initials}
          </div>
          <span className="text-sm text-white hidden sm:block">
            {DEFAULT_USER.name}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>
    </header>
  );
}
