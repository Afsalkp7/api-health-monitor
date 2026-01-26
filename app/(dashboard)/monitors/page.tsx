"use client";
import { MonitorListItem } from "@/app/types/dashboard";
import { MoreVertical, Search, Plus, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
// Mock Data (Region Removed)
// const monitors: MonitorListItem[] = [
//   {
//     id: "1",
//     name: "Auth Gateway API",
//     environment: "Production",
//     status: "UP",
//     method: "POST",
//     url: "api.cloudstack.io/v1/auth/login",
//     currentLatency: 124,
//     uptime7d: [120, 125, 122, 130, 124, 128, 121, 124],
//     lastChecked: "2024-01-26T10:00:00Z",
//   },
//   {
//     id: "2",
//     name: "Main Database Cluster",
//     environment: "Production",
//     status: "DOWN",
//     method: "GET",
//     url: "db-cluster.cloudstack.internal/health",
//     currentLatency: 0,
//     uptime7d: [45, 48, 42, 50, 0, 0, 0, 0],
//     lastChecked: "2024-01-26T10:05:00Z",
//   },
// ];

export default function MonitorListPage() {
  const { data: session } = useSession();
  const [monitors, setMonitors] = useState<MonitorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMonitors = async () => {
    if (!session?.user) return;
    console.log(session.user);

    try {
      const response = await axios.get("http://localhost:5000/api/monitor", {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`, // Use your actual token field
        },
      });
      setMonitors(response.data.data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load monitors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitors();

    // Optional: Auto-refresh every 10 seconds
    const interval = setInterval(fetchMonitors, 10000);
    return () => clearInterval(interval);
  }, [session]); // Re-run when session loads

  // --- RENDER HELPERS ---

  if (loading && monitors.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }
  console.log(monitors);

  return (
    <DashboardLayout title="System Monitors">
      {/* Table Content */}
      <div className="p-8">
        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Monitor Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                    Method
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Endpoint URL
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Latency
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    History (7d)
                  </th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {monitors.map((monitor) => (
                  <tr
                    key={monitor.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">
                          {monitor.name}
                        </span>
                        {/* Removed Region from subtitle */}
                        <span className="text-xs text-slate-400">
                          Production
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          monitor.status === "UP"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            monitor.status === "UP"
                              ? "bg-emerald-500 animate-pulse"
                              : "bg-rose-500"
                          }`}
                        ></span>
                        {monitor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                        {monitor.method}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {monitor.url}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-medium ${monitor.status === "UP" ? "text-emerald-500" : "text-rose-500"}`}
                      >
                        {monitor.status === "UP"
                          ? `${monitor.currentLatency}ms`
                          : "∞"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-end gap-[2px] h-6">
                        {monitor.uptime7d.map((val: any, i: any) => (
                          <div
                            key={i}
                            className={`w-1 rounded-sm ${val > 0 ? "bg-emerald-500" : "bg-rose-500"}`}
                            style={{ height: val > 0 ? "100%" : "20%" }}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
