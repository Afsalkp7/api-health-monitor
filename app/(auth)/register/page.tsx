"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Call your Backend Registration API
      const res = await fetch("/api/proxy/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // 2. Success - Redirect to OTP Page
      router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create Account"
      subtitle="Get started with your free account"
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkText="Sign in"
    >
      {error && (
        <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Name
          </label>
          <input
            type="text"
            required
            placeholder="Enter Your Name"
            className="w-full px-4 py-3 bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 rounded-lg outline-none text-sm transition-all"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Email
          </label>
          <input
            type="email"
            required
            placeholder="name@example.com"
            className="w-full px-4 py-3 bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 rounded-lg outline-none text-sm transition-all"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 rounded-lg outline-none text-sm transition-all"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full brand-gradient text-white font-semibold py-3.5 rounded-lg shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all hover:-translate-y-0.5 disabled:opacity-70"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </AuthCard>
  );
}