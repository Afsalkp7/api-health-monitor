"use client";
import { MonitorListItem } from "@/app/types/dashboard";
import {
  MoreVertical,
  Loader2,
  Eye,
  Edit,
  Play,
  Pause,
  Trash,
  Plus,
  Activity,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function MonitorListPage() {
  const { data: session } = useSession();
  const [monitors, setMonitors] = useState<MonitorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // --- ACTIONS (unchanged) ---
  const toggleMonitorStatus = async (id: string, currentStatus: boolean) => {
    try {
      setMonitors(
        monitors.map((m) =>
          m.id === id ? { ...m, isActive: !currentStatus } : m
        )
      );
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/monitor/${id}/toggle`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${session?.user.accessToken}` } }
      );
    } catch (error) {
      console.error("Toggle failed", error);
      fetchMonitors();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this monitor?")) return;
    try {
      setMonitors((prev) => prev.filter((m) => m.id !== id));
      setActiveMenuId(null);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/monitor/${id}`,
        { headers: { Authorization: `Bearer ${session?.user.accessToken}` } }
      );
    } catch (error) {
      console.error("Delete failed", error);
      fetchMonitors();
    }
  };

  const fetchMonitors = async () => {
    if (!session?.user) return;
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/monitor`,
        { headers: { Authorization: `Bearer ${session.user.accessToken}` } }
      );
      setMonitors(response.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitors();
    const interval = setInterval(fetchMonitors, 10000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId) window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [activeMenuId]);

  return (
    <DashboardLayout title="System Monitors">
      <div className="p-8">
        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[70vh]">
          
          {/* 1. LOADING STATE: Skeleton Table (Prevents White Flash) */}
          {loading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                    {/* Same headers as real table to prevent width jumps */}
                    {["Monitor Name", "Status", "Method", "Endpoint URL", "Latency", "History", ""].map((h, i) => (
                      <th key={i} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {/* Generate 5 skeleton rows */}
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20 mx-auto"></div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-12 mx-auto"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {[...Array(8)].map((_, j) => (
                            <div key={j} className="h-6 w-1 bg-slate-200 dark:bg-slate-700 rounded-sm"></div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : 
          
          // 2. EMPTY STATE
          monitors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center p-8 animate-in fade-in duration-500">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-full mb-6">
                <Activity className="text-slate-400 dark:text-slate-500 w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                No Monitors Configured
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
                You haven't set up any monitors yet. Start tracking your API endpoints to get real-time insights on uptime and latency.
              </p>
              <Link
                href="/monitors/new"
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
              >
                <Plus size={20} /> Create Your First Monitor
              </Link>
            </div>
          ) : (
            
            // 3. DATA TABLE (Real Content)
            <div className="overflow-x-auto min-h-[70vh] animate-in fade-in zoom-in-95 duration-300">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monitor Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Method</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Endpoint URL</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Latency</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">History (7d)</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {monitors.map((monitor) => (
                    <tr key={monitor.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{monitor.name}</span>
                          <span className="text-xs text-slate-400">Production</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${monitor.status === "UP" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${monitor.status === "UP" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
                          {monitor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">{monitor.method}</span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs text-slate-500 dark:text-slate-400 font-mono">{monitor.url}</code>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${monitor.status === "UP" ? "text-emerald-500" : "text-rose-500"}`}>
                          {monitor.status === "UP" ? `${monitor.currentLatency}ms` : "∞"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-end gap-[2px] h-6">
                          {(monitor.uptime7d && monitor.uptime7d.length > 0 ? monitor.uptime7d : new Array(8).fill(monitor.status === "UP" ? 1 : 0)).map((val: any, i: any) => (
                            <div key={i} className={`w-1 rounded-sm ${val > 0 ? "bg-emerald-500" : "bg-rose-500"}`} style={{ height: val > 0 ? "100%" : "20%" }} />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block text-left">
                          <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === monitor.id ? null : monitor.id); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <MoreVertical size={18} />
                          </button>
                          {activeMenuId === monitor.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} />
                              <div className="absolute right-0 z-50 mt-2 w-48 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                <Link href={`/monitors/${monitor.id}`} className="flex items-center gap-2 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                  <Eye size={16} /> View Details
                                </Link>
                                <Link href={`/monitors/${monitor.id}/edit`} className="flex items-center gap-2 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                  <Edit size={16} /> Edit Monitor
                                </Link>
                                <button onClick={(e) => { e.stopPropagation(); toggleMonitorStatus(monitor.id, !!monitor.isActive); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                                  {monitor.isActive ? <><Pause size={16} className="text-amber-500" /> Pause Monitor</> : <><Play size={16} className="text-emerald-500" /> Activate Monitor</>}
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(monitor.id); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left border-t border-slate-100 dark:border-slate-800">
                                  <Trash size={16} /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}