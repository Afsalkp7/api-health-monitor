"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
import {
  ArrowLeft,
  Pause,
  Play,
  Edit,
  Trash2,
  Activity,
  Clock,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import DashboardLayout from "@/components/layout/DashboardLayout";

// --- Helper to Generate Chart Data ---
const generateChartData = (data: any[], width: number, height: number) => {
  if (data.length === 0) return { area: "", points: [] };
  const entries = data.length === 1 ? [data[0], data[0]] : data;
  const validValues = entries
    .map((d) => (d.status === "DOWN" ? 0 : d.responseTime))
    .filter((v) => v > 0);
  const max = validValues.length > 0 ? Math.max(...validValues) : 100;
  const stepX = width / (entries.length - 1);
  const points = entries.map((entry, i) => {
    const x = i * stepX;
    const val = entry.status === "DOWN" ? 0 : entry.responseTime;
    const y = height - (val / max) * (height - 20) - 10;
    return {
      x,
      y,
      status: entry.status,
      responseTime: val,
      createdAt: entry.createdAt,
    };
  });
  const lineString = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaPath = `${lineString} L ${width} ${height} L 0 ${height} Z`;
  return { area: areaPath, points };
};

export default function MonitorDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [monitor, setMonitor] = useState<any>(null);

  // Separate Loading States
  const [loading, setLoading] = useState(true); // Core Monitor Data
  const [loadingPing, setLoadingPing] = useState(true); // Logs Table
  const [loadingIncident, setLoadingIncident] = useState(true); // Sidebar Incidents
  const [loadingGraph, setLoadingGraph] = useState(true); // Chart

  const [pingLogs, setPingLogs] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [graphData, setGraphData] = useState<any[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);

  // 1. Fetch Core Monitor Details
  const fetchMonitor = async () => {
    if (!session?.user || !id) return;
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/monitor/${id}`,
        { headers: { Authorization: `Bearer ${session.user.accessToken}` } },
      );
      setMonitor(res?.data?.data || res?.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Pings (Table)
  const fetchPings = async () => {
    if (!session?.user || !id) return;
    try {
      setLoadingPing(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/monitor/${id}/pings`,
        { headers: { Authorization: `Bearer ${session.user.accessToken}` } },
      );
      setPingLogs(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPing(false);
    }
  };

  // 3. Fetch Incidents (Sidebar)
  const fetchIncidents = async () => {
    if (!session?.user || !id) return;
    try {
      setLoadingIncident(true);
      // Ensure your backend endpoint matches this structure
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/incidents?monitorId=${id}`,
        { headers: { Authorization: `Bearer ${session.user.accessToken}` } },
      );
      const allIncidents = res.data?.data || [];
      // Client-side filtering just in case, though backend should handle it
      const relevantIncidents = allIncidents
        .filter((i: any) => i.monitor?._id === id || i.monitor === id)
        .slice(0, 5);
      setIncidents(relevantIncidents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingIncident(false);
    }
  };

  // 4. Fetch Graph Data
  const fetchGraphData = async () => {
    if (!session?.user || !id) return;
    try {
      setLoadingGraph(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/monitor/${id}/graph`,
        { headers: { Authorization: `Bearer ${session.user.accessToken}` } },
      );
      setGraphData(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch graph data", err);
    } finally {
      setLoadingGraph(false);
    }
  };

  // Initial Load
  useEffect(() => {
    if (session?.user && id) {
      fetchMonitor();
      fetchGraphData();
      fetchPings();
      fetchIncidents();
    }
  }, [id, session]);

  // Actions
  const toggleStatus = async () => {
    try {
      const newStatus = !monitor.isActive;
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/monitor/${id}/toggle`,
        { isActive: newStatus },
        { headers: { Authorization: `Bearer ${session?.user.accessToken}` } },
      );
      setMonitor({ ...monitor, isActive: newStatus });
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const deleteMonitor = async () => {
    if (!confirm("Are you sure you want to delete this monitor?")) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/monitor/${id}`,
        { headers: { Authorization: `Bearer ${session?.user.accessToken}` } },
      );
      router.push("/monitors");
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  // Global Loading (Only for core details)
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  if (!monitor) {
    return (
      <DashboardLayout>
        <div className="p-10 text-center text-slate-500">Monitor not found</div>
      </DashboardLayout>
    );
  }

  // Calculate Chart
  const { area, points } = generateChartData(graphData, 800, 200);

  return (
    <DashboardLayout title={monitor.friendlyName}>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* 1. Header & Actions */}
        <div>
          <Link
            href="/monitors"
            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-500 mb-6 transition-colors w-fit"
          >
            <ArrowLeft size={16} /> Back to Monitors
          </Link>
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <Activity className="text-indigo-500" size={32} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {monitor.friendlyName}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${monitor.isActive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20" : "bg-slate-100 text-slate-600 dark:text-slate-400 ring-slate-500/20"}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${monitor.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-500"}`}
                    ></span>
                    {monitor.isActive ? "Operational" : "Paused"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {monitor.method}
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 font-mono text-sm truncate max-w-md">
                    {monitor.url}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleStatus}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-700 dark:text-slate-200 shadow-sm"
              >
                {monitor.isActive ? (
                  <>
                    <Pause size={16} className="text-amber-500" /> Pause
                  </>
                ) : (
                  <>
                    <Play size={16} className="text-emerald-500" /> Resume
                  </>
                )}
              </button>
              <Link
                href={`/monitors/${id}/edit`}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-700 dark:text-slate-200 shadow-sm"
              >
                <Edit size={16} /> Edit
              </Link>
              {/* <button onClick={deleteMonitor} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all text-red-600 dark:text-red-400 shadow-sm group">
                <Trash2 size={16} /> Delete
              </button> */}
            </div>
          </header>
        </div>

        {/* 2. Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1: Uptime */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Uptime (24h)
            </p>
            <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">
              {monitor.uptime}%
            </p>
            {/* 24h Bar */}
            <div className="mt-4 flex gap-[1px] h-2">
              {(Array.isArray(monitor?.status) && monitor.status.length > 0
                ? monitor.status
                : new Array(24).fill("UP")
              ).map((s: string, i: number) => (
                <div
                  key={i}
                  className={`flex-1 rounded-[1px] ${s === "UP" ? "bg-emerald-500" : "bg-red-500"}`}
                />
              ))}
            </div>
          </div>

          {/* Card 2: Latency */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Avg. Latency
            </p>
            <p className="text-3xl font-bold mt-2 text-indigo-600 dark:text-indigo-400">
              {monitor.averageLatency || 0}ms
            </p>
            <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <Activity size={12} /> Real-time
            </div>
          </div>

          {/* Card 3: Success Rate */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Success Rate
            </p>
            <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">
              {monitor.successRate}%
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Past 30 days
            </p>
          </div>

          {/* Card 4: Last Checked */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Last Checked
            </p>
            <p className="text-md font-bold mt-2 text-slate-900 dark:text-white">
              {monitor.lastChecked
                ? formatDistanceToNow(new Date(monitor.lastChecked), {
                    addSuffix: true,
                  })
                : "Never"}
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Every {monitor.frequency}s
            </p>
          </div>
        </div>

        {/* 3. Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Chart & Table */}
          <div className="lg:col-span-2 space-y-8">
            {/* Chart Section */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm overflow-hidden relative min-h-[300px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Response Time History
                </h3>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full">
                  Last 20 Checks
                </span>
              </div>

              {/* CHART LOADING STATE */}
              {loadingGraph ? (
                <div className="w-full h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-lg animate-pulse">
                  <Activity className="text-slate-300 dark:text-slate-700 w-12 h-12" />
                </div>
              ) : (
                <div
                  className="relative w-full h-64 cursor-crosshair"
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {/* ... (Your SVG Chart Code here - unchanged) ... */}
                  {hoveredPoint && (
                    <div
                      className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 flex flex-col items-center"
                      style={{
                        left: `${(hoveredPoint.x / 800) * 100}%`,
                        top: `${(hoveredPoint.y / 200) * 100}%`,
                      }}
                    >
                      <div className="bg-slate-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl border border-slate-700 whitespace-nowrap text-center">
                        <p className="font-bold text-emerald-400">
                          {hoveredPoint.responseTime}ms
                        </p>
                        <p className="text-slate-400 text-[10px]">
                          {format(new Date(hoveredPoint.createdAt), "HH:mm:ss")}
                        </p>
                      </div>
                      <div className="w-2 h-2 bg-slate-900 border-r border-b border-slate-700 transform rotate-45 -mt-1"></div>
                    </div>
                  )}
                  <svg
                    className="w-full h-full overflow-visible"
                    viewBox="0 0 800 200"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="chartFill"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#6366f1"
                          stopOpacity="0.3"
                        ></stop>
                        <stop
                          offset="100%"
                          stopColor="#6366f1"
                          stopOpacity="0"
                        ></stop>
                      </linearGradient>
                    </defs>
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-2 opacity-50">
                      <div className="w-full border-t border-slate-100 dark:border-slate-800/50"></div>
                      <div className="w-full border-t border-slate-100 dark:border-slate-800/50"></div>
                      <div className="w-full border-t border-slate-100 dark:border-slate-800/50"></div>
                    </div>
                    <path d={area} fill="url(#chartFill)" />
                    {points.map((p: any, i: number) => {
                      if (i === 0) return null;
                      const prev = points[i - 1];
                      const isDown = p.status === "DOWN";
                      return (
                        <line
                          key={`line-${i}`}
                          x1={prev.x}
                          y1={prev.y}
                          x2={p.x}
                          y2={p.y}
                          stroke={isDown ? "#ef4444" : "#6366f1"}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      );
                    })}
                    {points.map((p: any, i: number) => (
                      <g key={i}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={
                            hoveredPoint?.x === p.x
                              ? 5
                              : p.status === "DOWN"
                                ? 3
                                : 0
                          }
                          className={`stroke-[3px] transition-all duration-75 ${p.status === "DOWN" ? "fill-red-500 stroke-red-500" : "fill-white stroke-indigo-500"}`}
                          style={{
                            opacity:
                              hoveredPoint?.x === p.x || p.status === "DOWN"
                                ? 1
                                : 0,
                          }}
                        />
                        {hoveredPoint?.x === p.x && (
                          <line
                            x1={p.x}
                            y1={0}
                            x2={p.x}
                            y2={200}
                            stroke="white"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                            opacity="0.3"
                          />
                        )}
                        <rect
                          x={p.x - 800 / points.length / 2}
                          y="0"
                          width={800 / points.length}
                          height="200"
                          fill="transparent"
                          onMouseEnter={() => setHoveredPoint(p)}
                        />
                      </g>
                    ))}
                  </svg>
                </div>
              )}
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Recent Pings
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Method</th>
                      <th className="px-6 py-3">Response Time</th>
                      <th className="px-6 py-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                    {/* TABLE LOADING STATE */}
                    {loadingPing ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4">
                            <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-12 bg-slate-100 dark:bg-slate-800 rounded"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded"></div>
                          </td>
                        </tr>
                      ))
                    ) : pingLogs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-8 text-center text-slate-500 italic"
                        >
                          No logs available yet.
                        </td>
                      </tr>
                    ) : (
                      pingLogs.map((log: any, i: number) => (
                        <tr
                          key={i}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full ${log.status === "UP" ? "bg-emerald-500" : "bg-rose-500"}`}
                              ></div>
                              <span
                                className={`font-medium ${log.status === "UP" ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}
                              >
                                {log.statusCode ||
                                  (log.status === "UP" ? 200 : 500)}{" "}
                                {log.status === "UP" ? "OK" : log.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 uppercase">
                              {monitor.method}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">
                            {log.responseTime}ms
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                            {log.createdAt
                              ? formatDistanceToNow(new Date(log.createdAt), {
                                  addSuffix: true,
                                })
                              : "Just now"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar Info */}
          <div className="space-y-6">
            {/* Monitor Details Card */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <h4 className="font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                <Clock className="text-indigo-500" size={18} /> Monitor Details
              </h4>
              <dl className="space-y-4 text-sm">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 pb-2">
                  <dt className="text-slate-500 dark:text-slate-400">Type</dt>
                  <dd className="font-medium text-slate-900 dark:text-white">
                    HTTP(S) {monitor.method}
                  </dd>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 pb-2">
                  <dt className="text-slate-500 dark:text-slate-400">
                    Interval
                  </dt>
                  <dd className="font-medium text-slate-900 dark:text-white">
                    {monitor.frequency}s
                  </dd>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 pb-2">
                  <dt className="text-slate-500 dark:text-slate-400">
                    Timeout
                  </dt>
                  <dd className="font-medium text-slate-900 dark:text-white">
                    {monitor.timeout / 1000}s
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-slate-500 dark:text-slate-400">
                    Created
                  </dt>
                  <dd className="font-medium text-slate-900 dark:text-white">
                    {new Date(monitor.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>

            {/* DYNAMIC INCIDENTS CARD */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <h4 className="font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                <AlertTriangle className="text-amber-500" size={18} /> Recent
                Incidents
              </h4>

              {/* INCIDENTS LOADING STATE */}
              {loadingIncident ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-3/4 bg-slate-100 dark:bg-slate-800 rounded"></div>
                        <div className="h-2 w-1/2 bg-slate-100 dark:bg-slate-800 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : incidents.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2 opacity-50" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                    No recent incidents reported.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incidents.map((incident: any) => {
                    const isResolved = incident.isResolved;
                    return (
                      <div
                        key={incident._id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800"
                      >
                        <div
                          className={`mt-0.5 min-w-[24px] min-h-[24px] rounded-full flex items-center justify-center ${isResolved ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}
                        >
                          {isResolved ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}
                        </div>
                        <div>
                          <p
                            className={`text-xs font-bold uppercase mb-1 ${isResolved ? "text-emerald-600" : "text-rose-600"}`}
                          >
                            {isResolved ? "Resolved" : "Ongoing Incident"}
                          </p>
                          <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-tight">
                            {incident.cause}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {formatDistanceToNow(new Date(incident.startedAt), {
                              addSuffix: true,
                            })}
                            {isResolved &&
                              incident.duration &&
                              ` • ${Math.ceil(incident.duration / 60)}m`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
