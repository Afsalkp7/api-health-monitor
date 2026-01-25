"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter
import AuthCard from "@/components/auth/AuthCard";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter(); // Initialize router
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Call Backend API
      const res = await fetch("/api/proxy/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send reset OTP");
      }

      // 2. Success! Redirect to Reset Password Page
      // We pass the email so the next page knows who to reset
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email address and we will send you a code to reset it."
    >
      {error && (
        <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Email Address
          </label>
          <div className="relative group">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
              size={20}
            />
            <input
              type="email"
              required
              placeholder="name@example.com"
              className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 rounded-lg outline-none text-sm transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full brand-gradient text-white font-semibold py-3.5 rounded-lg shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all hover:-translate-y-0.5 disabled:opacity-70"
        >
          {loading ? "Sending Code..." : "Send Reset Code"}
        </button>

        <div className="text-center border-t border-slate-200/50 dark:border-slate-700/50 pt-6">
          <Link
            href="/login"
            className="text-sm text-slate-500 hover:text-indigo-500 flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft size={16} /> Return to Login
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
