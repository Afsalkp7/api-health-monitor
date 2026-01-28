"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
import { 
  AlertTriangle, 
  TrendingDown, 
  CheckCircle2, 
  Activity, 
  ArrowRight,
  Loader2,
  Clock,
  ShieldAlert
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function InsightsPage() {
  const { data: session } = useSession();
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    if (!session?.user) return;
    try {
      // We will create this endpoint next
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/insights`,
        { headers: { Authorization: `Bearer ${session.user.accessToken}` } }
      );
      setInsights(res.data.data || []);
    } catch (err) {
      console.error("Failed to load insights", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [session]);

  if (loading) {
    return (
      <DashboardLayout title="Analytics & Insights">
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  const activeInsights = insights.filter(i => i.isActive);
  const resolvedInsights = insights.filter(i => !i.isActive);

  // Simple Health Logic
  const systemHealth = activeInsights.length === 0 ? "Excellent" : activeInsights.some(i => i.severity === "CRITICAL") ? "Critical" : "Degraded";
  const healthColor = systemHealth === "Excellent" ? "text-emerald-500" : systemHealth === "Critical" ? "text-rose-500" : "text-amber-500";
  const healthBg = systemHealth === "Excellent" ? "bg-emerald-500" : systemHealth === "Critical" ? "bg-rose-500" : "bg-amber-500";

  return (
    <DashboardLayout title="Analytics & Insights">
      <div className="p-8 max-w-7xl mx-auto">
        
        {/* 1. Health Overview Banner */}
        <div className="mb-8 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${systemHealth === "Excellent" ? "bg-emerald-100 dark:bg-emerald-900/20" : systemHealth === "Critical" ? "bg-rose-100 dark:bg-rose-900/20" : "bg-amber-100 dark:bg-amber-900/20"}`}>
               {systemHealth === "Excellent" ? <CheckCircle2 className={healthColor} size={32} /> : <Activity className={healthColor} size={32} />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">System Health: <span className={healthColor}>{systemHealth}</span></h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                {activeInsights.length === 0 
                  ? "All systems are operating within normal parameters." 
                  : `${activeInsights.length} active anomalies detected affecting system performance.`}
              </p>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Events (24h)</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{insights.length}</p>
          </div>
        </div>

        {/* 2. Active Anomalies Section */}
        <div className="mb-10">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <ShieldAlert className="text-indigo-500" size={20} /> Active Anomalies
          </h3>

          {activeInsights.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
              <CheckCircle2 className="mx-auto text-emerald-500 mb-4 opacity-50" size={48} />
              <h3 className="text-slate-900 dark:text-white font-medium">No Active Issues</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Your API infrastructure is running smoothly.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeInsights.map((insight) => (
                <InsightCard key={insight._id} insight={insight} />
              ))}
            </div>
          )}
        </div>

        {/* 3. Resolved History (Optional, slightly faded) */}
        {resolvedInsights.length > 0 && (
          <div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 opacity-75">
              <Clock className="text-slate-400" size={20} /> Recently Resolved
            </h3>
            <div className="grid gap-4 opacity-75 hover:opacity-100 transition-opacity">
              {resolvedInsights.slice(0, 5).map((insight) => (
                <InsightCard key={insight._id} insight={insight} />
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

// --- SUB-COMPONENT: Individual Card ---
function InsightCard({ insight }: { insight: any }) {
  const isCritical = insight.severity === "CRITICAL";
  const isDegraded = insight.type === "DEGRADED_PERFORMANCE";
  
  // Theme Logic based on Severity
  const borderColor = isCritical ? "border-rose-500" : "border-amber-500";
  const iconBg = isCritical ? "bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400" : "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400";
  
  // Resolved State Override
  const isResolved = !insight.isActive;
  const finalBorder = isResolved ? "border-emerald-500" : borderColor;
  const finalIconBg = isResolved ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" : iconBg;

  return (
    <div className={`bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-start md:items-center relative overflow-hidden border-l-4 ${finalBorder}`}>
      
      {/* Icon Box */}
      <div className={`p-3 rounded-lg shrink-0 ${finalIconBg}`}>
        {isResolved ? <CheckCircle2 size={24} /> : isDegraded ? <TrendingDown size={24} /> : <AlertTriangle size={24} />}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-bold text-slate-900 dark:text-white text-base">
            {insight.type === "DEGRADED_PERFORMANCE" ? "Performance Degradation" : "Reliability Issue"}
          </h4>
          {!isResolved && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${isCritical ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"}`}>
              {insight.severity}
            </span>
          )}
          {isResolved && <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-100 text-emerald-600">Resolved</span>}
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
          {insight.details}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
           <span className="flex items-center gap-1">
             <Activity size={12} /> Monitor: <span className="font-medium text-slate-700 dark:text-slate-200">{insight.monitor?.friendlyName || "Unknown API"}</span>
           </span>
           <span className="flex items-center gap-1">
             <Clock size={12} /> {isResolved ? "Resolved" : "Detected"} {formatDistanceToNow(new Date(insight.updatedAt), { addSuffix: true })}
           </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="shrink-0 w-full md:w-auto mt-2 md:mt-0">
        <Link 
          href={`/monitors/${insight.monitor?._id || insight.monitor}`}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
        >
          View Data <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}