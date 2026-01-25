"use client";

import { useState, useEffect } from "react";

export default function ResendOtp({ email }: { email: string }) {
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Countdown timer logic
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleResend = async () => {
    if (timer > 0 || loading) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/proxy/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed to resend");

      setMessage("Code sent!");
      setTimer(30); // Reset timer to 30s
    } catch (error) {
      setMessage("Error sending code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center mt-6 text-sm">
      <p className="text-slate-500">
        Didn't receive the code?{" "}
        {timer > 0 ? (
          <span className="text-slate-400 font-medium">Resend in {timer}s</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="text-indigo-500 font-bold hover:underline disabled:opacity-50"
          >
            {loading ? "Sending..." : "Resend Code"}
          </button>
        )}
      </p>
      {message && <p className="text-xs text-green-500 mt-2">{message}</p>}
    </div>
  );
}
