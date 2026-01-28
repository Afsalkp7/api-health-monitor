"use client";

import { Search, Plus, Bell, Menu } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
  title?: string;
  subtitle?: string;
  onMenuClick: () => void; // New prop to trigger sidebar
}

export default function Navbar({
  title = "Overview",
  subtitle = "Manage and track your API health in real-time.",
  onMenuClick,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-4 flex items-center justify-between transition-all">
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-4">
        {/* HAMBURGER BUTTON (Mobile Only) */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg"
        >
          <Menu size={24} />
        </button>

        <div>
          <h1 className="text-sm sm:text-md md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate max-w-[200px] md:max-w-none">
            {title}
          </h1>
          {/* Hide subtitle on very small screens to save space */}
          <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* CTA Button */}
        <Link
          href="/monitors/new"
          className="flex items-center justify-center w-8 h-8 md:w-auto md:h-auto md:gap-2 md:px-4 md:py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={18} />
          <span className="hidden md:inline">Create Monitor</span>
        </Link>
      </div>
    </header>
  );
}
