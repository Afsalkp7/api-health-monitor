"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import AuthCard from "@/components/auth/AuthCard";
import ResendOtp from "@/components/auth/ResendOtp"; // Import reusable component

function VerifyOtpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle Input Change
  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  // Handle Backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter a valid 6-digit code");
      setLoading(false);
      return;
    }

    try {
      // Auto-Login Logic using NextAuth
      const res = await signIn("credentials", {
        redirect: false,
        email: email,
        otp: otpValue,
        loginType: "otp", // Trigger OTP logic in authOptions
      });

      if (res?.error) {
        throw new Error(res.error || "Invalid OTP");
      }

      // Success! Auto-redirect to Dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError("Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Verify your email"
      subtitle={`We've sent a 6-digit verification code to ${email}`}
      // NOTE: We removed footerText props here to use the ResendOtp component instead
      footerText=""
      footerLink=""
    >
      {error && (
        <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex justify-between gap-1 min-[430px]:gap-2 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-8 h-8 min-[400px]:w-12 min-[430px]:h-12 text-center text-2xl font-bold bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full brand-gradient text-white font-semibold py-4 rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all hover:-translate-y-0.5 disabled:opacity-70"
        >
          {loading ? "Verifying..." : "Verify Code"}
        </button>
      </form>

      {/* Resend Logic is now INSIDE the card */}
      <ResendOtp email={email} />
    </AuthCard>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <VerifyOtpPageContent />
    </Suspense>
  );
}
