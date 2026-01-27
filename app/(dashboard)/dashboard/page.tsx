"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  CheckCircle2,
  Zap,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatDistanceToNow } from "date-fns";

export default function DashboardOverviewPage() {
  const { data: session } = useSession();

  // State for Stats
  const [stats, setStats] = useState({
    globalUptime: 0,
    avgLatency: 0,
    totalMonitors: 0,
    activeMonitors: 0,
  });

  // State for Incidents
  const [incidents, setIncidents] = useState([]);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingIncidents, setLoadingIncidents] = useState(true);

  // Fetch Data on Load
  useEffect(() => {
    if (!session?.user) return;

    const fetchStats = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/monitor/stats`,
          {
            headers: { Authorization: `Bearer ${session.user.accessToken}` },
          },
        );
        setStats(res.data.data);
      } catch (error) {
        console.error("Stats Error:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchIncidents = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/incidents/recent`,
          {
            headers: { Authorization: `Bearer ${session.user.accessToken}` },
          },
        );
        setIncidents(res.data.data || []);
      } catch (error) {
        console.error("Incidents Error:", error);
      } finally {
        setLoadingIncidents(false);
      }
    };

    // Run both requests in parallel
    fetchStats();
    fetchIncidents();
  }, [session]);

  // Loading Screen (Only if Stats are still loading - Incidents can load lazily)
  if (loadingStats) {
    return (
      <DashboardLayout title="Dashboard Overview">
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  // Percentage Calculation
  const usagePercentage =
    stats.totalMonitors > 0
      ? Math.round((stats.activeMonitors / stats.totalMonitors) * 100)
      : 0;
  const strokeDashArray = `${usagePercentage}, 100`;

  return (
    <DashboardLayout title="Dashboard Overview">
      <div className="p-8">
        {/* --- SECTION 1: STATS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Uptime */}
          <div className="bg-white dark:bg-[#161b22] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Global Uptime
                </p>
                <h3 className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">
                  {stats.globalUptime}%
                </h3>
              </div>
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <CheckCircle2 size={24} />
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-4">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${stats.globalUptime}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Last 24 Hours</p>
          </div>

          {/* Card 2: Latency */}
          <div className="bg-white dark:bg-[#161b22] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Avg Latency
                </p>
                <h3 className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">
                  {stats.avgLatency}ms
                </h3>
              </div>
              <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                <Zap size={24} />
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-4">
              <div
                className="bg-purple-500 h-full rounded-full"
                style={{ width: `${Math.min(stats.avgLatency / 5, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Average across active monitors
            </p>
          </div>

          {/* Card 3: Active Monitors */}
          <div className="bg-white dark:bg-[#161b22] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Monitors
              </p>
              <h3 className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">
                {stats.activeMonitors}{" "}
                <span className="text-slate-400 text-lg font-normal">
                  / {stats.totalMonitors}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-2">
                {usagePercentage}% currently active
              </p>
            </div>
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  className="stroke-slate-100 dark:stroke-slate-800"
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  strokeWidth="3"
                ></circle>
                <circle
                  className="stroke-blue-500 transition-all duration-1000 ease-out"
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  strokeWidth="3"
                  strokeDasharray={strokeDashArray}
                  strokeLinecap="round"
                ></circle>
              </svg>
              <span className="absolute text-xs font-bold text-blue-500">
                {usagePercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* --- SECTION 2: INCIDENTS LIST --- */}
        <div className="bg-white dark:bg-[#161b22] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[200px]">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <AlertCircle className="text-rose-500" size={20} /> Recent Incidents
          </h2>

          {loadingIncidents ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-slate-400" size={24} />
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.length === 0 ? (
                <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                  <CheckCircle className="mx-auto h-10 w-10 text-emerald-500 mb-3 opacity-50" />
                  <p>No recent incidents. All systems operational.</p>
                </div>
              ) : (
                incidents.map((incident: any) => {
                  const isResolved = incident.isResolved;
                  return (
                    <div
                      key={incident._id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${isResolved ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
                        >
                          {isResolved ? (
                            <CheckCircle size={20} />
                          ) : (
                            <AlertCircle size={20} />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {incident.monitor?.friendlyName ||
                              "Unknown Monitor"}
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {incident.cause}
                          </p>
                        </div>
                      </div>
                      <div className="text-left md:text-right pl-14 md:pl-0">
                        <span
                          className={`inline-block px-2 py-1 text-[10px] font-bold rounded uppercase mb-1 ${isResolved ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
                        >
                          {isResolved ? "RESOLVED" : "ONGOING"}
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDistanceToNow(new Date(incident.startedAt), {
                            addSuffix: true,
                          })}
                          {isResolved &&
                            incident.duration &&
                            ` • Duration: ${Math.ceil(incident.duration / 60)}m`}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
