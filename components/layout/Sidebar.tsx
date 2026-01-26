"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  BarChart2,
  Settings,
  X,
  LogOut, // Close Icon
} from "lucide-react";
import { signOut } from "next-auth/react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Monitors", href: "/monitors", icon: Activity },
    { name: "Incidents", href: "/incidents", icon: AlertTriangle },
    { name: "Analytics", href: "/analytics", icon: BarChart2 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* MOBILE BACKDROP OVERLAY */}
      {/* Only visible on mobile when open */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* SIDEBAR CONTAINER */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#020617] border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 
        `}
      >
        {/* 1. Header (Logo + Close Button) */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-1">
            <div className="w-16 h-auto  flex items-center justify-center ">
              {/* <Activity className="text-white" size={18} /> */}
              <img src="/logo.png" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
              Cloudstack
            </span>
          </div>

          {/* Close Button (Mobile Only) */}
          <button
            onClick={onClose}
            className="md:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose} // Auto-close on mobile when link clicked
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Icon
                  size={20}
                  className={`transition-colors ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"}`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* 3. Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                Jane Doe
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                sample@example.com
              </p>
            </div>
            <button onClick={()=>signOut()} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
