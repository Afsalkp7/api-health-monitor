"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({
  children,
  title,
  subtitle,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#020617] font-sans text-slate-900 dark:text-slate-100">
      {/* 1. Sidebar (Passes state & closer function) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* 2. Main Content Area */}
      {/* md:ml-64 ensures content is pushed right on desktop, but takes full width on mobile */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0 transition-all duration-300">
        {/* Navbar (Passes opener function) */}
        <Navbar
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
