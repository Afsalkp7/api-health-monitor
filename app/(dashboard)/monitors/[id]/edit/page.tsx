"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Info,
  Globe,
  Clock,
  ShieldCheck,
  Plus,
  Trash2,
  Copy,
  Loader2,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Frequency Options mapped to seconds
const FREQUENCIES = [
  { label: "10s", value: 10 },
  { label: "20s", value: 20 },
  { label: "1m", value: 60 },
  { label: "5m", value: 300 },
  { label: "10m", value: 600 },
  { label: "30m", value: 1800 },
];
const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

export default function EditMonitorPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // --- Form State ---
  const [friendlyName, setFriendlyName] = useState("");
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [body, setBody] = useState("");
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([]);
  const [frequency, setFrequency] = useState(60);
  const [timeout, setTimeout] = useState(10000);
  const [expectedCode, setExpectedCode] = useState(200);

  // Fetch Existing Data
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user || !id) return;
      try {
        // CHANGED: Endpoint to /monitor/${id}
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/monitor/${id}`,
          {
            headers: { Authorization: `Bearer ${session.user.accessToken}` },
          }
        );

        // CHANGED: Access data via res.data.data based on your JSON structure
        const m = res.data.data;

        setFriendlyName(m.friendlyName || "");
        setUrl(m.url || "");
        setMethod(m.method || "GET");
        setBody(m.body || "");
        setFrequency(m.frequency || 60);
        setTimeout(m.timeout || 10000);
        setExpectedCode(m.expectedCode || 200);

        // Handle Headers (Assuming backend returns [{ "key": "value" }] or [])
        if (Array.isArray(m.headers) && m.headers.length > 0) {
          // Extract the first object from the array (if your structure is [ {k:v, k:v} ])
          const headerObj = m.headers[0];
          const mappedHeaders = Object.entries(headerObj).map(([k, v]) => ({
            key: k,
            value: String(v),
          }));
          setHeaders(mappedHeaders);
        } else {
          setHeaders([]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load monitor details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, session]);

  // Handle Update
  const handleUpdate = async () => {
    setSaving(true);
    setError("");

    if (!friendlyName || !url) {
        setError("Please provide a name and URL.");
        setSaving(false);
        return;
    }

    try {
      // 1. Convert Headers Array -> Object
      const headersObj: Record<string, string> = {};
      headers.forEach((h) => {
        if (h.key) headersObj[h.key] = h.value;
      });

      // 2. Prepare Payload
      const payload = {
        friendlyName,
        url,
        method,
        // Match Create Page logic: wrap object in array
        headers: !headers?.length ? [] : [headersObj],
        body,
        frequency,
        timeout,
        expectedCode: Number(expectedCode),
      };

      // CHANGED: Endpoint to /monitor/${id}
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/monitor/${id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        }
      );

      router.push(`/monitors`); // Redirect to Details Page
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update monitor");
    } finally {
      setSaving(false);
    }
  };

  // --- Helpers ---
  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index: number) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    setHeaders(newHeaders);
  };

  const updateHeader = (index: number, field: "key" | "value", val: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = val;
    setHeaders(newHeaders);
  };

  if (loading) {
    return (
      <DashboardLayout title="Edit Monitor">
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Edit Monitor"
      subtitle={`Update configuration for ${friendlyName}`}
    >
      <div className="min-h-screen text-slate-100 pb-20">
        <div className="max-w-4xl mx-auto p-8 space-y-8">
          
          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* SECTION 1: GENERAL INFO */}
          <section className="bg-[#1E293B] rounded-xl border border-slate-700/50 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 flex items-center gap-2">
              <Info size={20} className="text-blue-400" />
              <h2 className="font-semibold text-white">General Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#94a3b8]">
                  Friendly Name
                </label>
                <input
                  value={friendlyName}
                  onChange={(e) => setFriendlyName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="e.g. Auth Service Production"
                  type="text"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#94a3b8]">
                  URL
                </label>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="https://api.yourdomain.com/v1/health"
                  type="url"
                />
              </div>
            </div>
          </section>

          {/* SECTION 2: REQUEST SETTINGS */}
          <section className="bg-[#1E293B] rounded-xl border border-slate-700/50 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 flex items-center gap-2">
              <Globe size={20} className="text-blue-400" />
              <h2 className="font-semibold text-white">Request Settings</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Method Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-[#94a3b8] block">
                  Method
                </label>
                <div className="flex flex-wrap gap-2 p-1 bg-[#0F172A] rounded-xl w-fit border border-slate-800">
                  {METHODS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                        method === m
                          ? "bg-blue-500 text-white shadow-lg"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Headers */}
              <div className="border border-slate-700 rounded-lg overflow-hidden bg-[#0F172A]">
                <div className="flex items-center justify-between p-4 bg-[#0F172A]">
                  <span className="text-sm font-medium flex items-center gap-2 text-[#94a3b8]">
                    Headers (Optional)
                  </span>
                  <button
                    onClick={addHeader}
                    className="text-xs font-semibold text-blue-400 flex items-center gap-1 hover:text-blue-300"
                  >
                    <Plus size={14} /> Add header
                  </button>
                </div>

                <div className="p-4 border-t border-slate-700 space-y-3 bg-[#1E293B]/50">
                  {headers.length === 0 && (
                    <p className="text-xs text-slate-600 italic">
                      No custom headers configured.
                    </p>
                  )}
                  {headers.map((h, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center"
                    >
                      <input
                        value={h.key}
                        onChange={(e) =>
                          updateHeader(index, "key", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm bg-[#1E293B] border border-slate-700 rounded text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                        placeholder="Key (e.g. Authorization)"
                      />
                      <input
                        value={h.value}
                        onChange={(e) =>
                          updateHeader(index, "value", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm bg-[#1E293B] border border-slate-700 rounded text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                        placeholder="Value"
                      />
                      <button
                        onClick={() => removeHeader(index)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* JSON Body Editor */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#94a3b8]">
                  Request Body (JSON)
                </label>
                <div className="rounded-lg border border-slate-700 overflow-hidden bg-slate-950">
                  <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      JSON Editor
                    </span>
                    <Copy
                      size={14}
                      className="text-slate-600 cursor-pointer hover:text-slate-400"
                    />
                  </div>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full p-4 bg-transparent text-emerald-400 text-sm font-mono focus:ring-0 border-none outline-none h-32 resize-y"
                    placeholder='{ "id": "test-request" }'
                  ></textarea>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3 & 4: CONFIG & VALIDATION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CONFIG */}
            <section className="bg-[#1E293B] rounded-xl border border-slate-700/50 shadow-xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-700/50 flex items-center gap-2">
                <Clock size={20} className="text-blue-400" />
                <h2 className="font-semibold text-white">Monitoring Config</h2>
              </div>
              <div className="p-6 flex-1 space-y-6">
                <div className="space-y-4">
                  <label className="text-sm font-medium text-[#94a3b8]">
                    Frequency
                  </label>
                  <div className="grid grid-cols-6 gap-1 p-1 bg-[#0F172A] rounded-lg border border-slate-800">
                    {FREQUENCIES.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setFrequency(f.value)}
                        className={`text-center py-2 text-[10px] font-bold rounded transition-all ${
                          frequency === f.value
                            ? "bg-blue-500 text-white shadow-md"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#94a3b8]">
                    Timeout (ms)
                  </label>
                  <div className="relative">
                    <input
                      value={timeout}
                      onChange={(e) => setTimeout(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-[#0F172A] border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      max="30000"
                      step="1000"
                      type="number"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">
                      MAX 30s
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* VALIDATION */}
            <section className="bg-[#1E293B] rounded-xl border border-slate-700/50 shadow-xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-700/50 flex items-center gap-2">
                <ShieldCheck size={20} className="text-blue-400" />
                <h2 className="font-semibold text-white">Validation</h2>
              </div>
              <div className="p-6 flex-1 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#94a3b8]">
                    Expected Status Code
                  </label>
                  <input
                    value={expectedCode}
                    onChange={(e) => setExpectedCode(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#0F172A] border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="200"
                    type="number"
                  />
                  <p className="text-[10px] text-slate-500 mt-2 uppercase font-bold tracking-tight">
                    Monitor will mark as DOWN if status differs
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-end gap-6 py-8">
            <Link
              href={`/monitors`}
              className="px-6 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="flex items-center gap-2 px-10 py-3.5 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-bold rounded-xl shadow-xl shadow-blue-500/20 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save size={18} /> Update Monitor
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}