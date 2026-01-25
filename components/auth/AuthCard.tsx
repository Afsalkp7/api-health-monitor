"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footerText?: string;
  footerLink?: string;
  footerLinkText?: string;
}

export default function AuthCard({
  children,
  title,
  subtitle,
  footerText,
  footerLink,
  footerLinkText,
}: AuthCardProps) {
  const [darkMode, setDarkMode] = useState(true);

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="font-sans bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-300">
      {/* --- BACKGROUND BLOBS (Fixed Z-Index) --- */}
      {/* Added 'z-0' to keep these strictly in the background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full brand-gradient northern-lights pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500 northern-lights pointer-events-none z-0" />
      <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-purple-600 northern-lights pointer-events-none opacity-20 z-0" />

      {/* --- MAIN CARD (Fixed Z-Index) --- */}
      {/* Changed 'z-10' to 'z-50' to force the form ABOVE the background blobs */}
      <main className="relative z-50 w-full max-w-md px-6 py-12">
        <div className="glass-card bg-white/70 dark:bg-slate-900/60 border border-white/20 dark:border-slate-700/50 shadow-2xl rounded-2xl p-8 md:p-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="h-12 rounded-lg flex items-center justify-center mb-3">
              <span className="text-2xl">
                {/* Replace with your logo path */}
                <img src="/logo.png" alt="Logo" className="h-24 w-auto" />
              </span>
            </div>
            <h1 className="text-xl font-bold mb-1">{title}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium text-center">
              {subtitle}
            </p>
          </div>

          {/* Form Content */}
          {children}

          {/* Footer */}
          {footerText && footerLink && (
            <div className="mt-8 pt-8 border-t border-slate-200/50 dark:border-slate-700/50">
              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                {footerText}{" "}
                <Link
                  href={footerLink}
                  className="text-indigo-500 font-bold hover:underline"
                >
                  {footerLinkText}
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Legal Links */}
        <div className="mt-8 flex justify-center space-x-6 text-xs text-slate-400 dark:text-slate-500 font-medium">
          <Link
            href="#"
            className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="#"
            className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Status
          </Link>
        </div>
      </main>

      {/* --- DARK MODE TOGGLE --- */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed bottom-6 right-6 p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-[60] group hover:scale-110 transition-all"
      >
        {darkMode ? (
          <Sun size={20} className="text-yellow-400" />
        ) : (
          <Moon size={20} className="text-slate-600" />
        )}
      </button>
    </div>
  );
}
