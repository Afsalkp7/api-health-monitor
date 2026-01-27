"use client";
import { AlertCircle, CheckCircle2, Loader2, Clock } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

export default function IncidentsPage() {
  const { data: session } = useSession();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchIncidents = async () => {
    if (!session?.user) return;

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/incidents`,
        {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        }
      );

      setIncidents(response.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load incidents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [session]);

  if (loading) {
    return (
      <DashboardLayout title="Incidents">
        <div className="flex h-[70vh] items-center justify-center">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="System Incidents">
      <div className="p-8">
        <div className="rounded-xl shadow-sm overflow-hidden min-h-[70vh]">
          <div className="flex flex-col gap-3">
            
            {/* Empty State */}
            {incidents.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
                <p>No incidents found. All systems operational.</p>
              </div>
            )}

            {/* Incident List */}
            {incidents.map((incident) => {
              // Determine styles based on resolution
              const isResolved = incident.isResolved;
              const colorClass = isResolved
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-rose-500/10 text-rose-500";

              return (
                <div
                  key={incident._id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon Box */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}
                    >
                      {isResolved ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <AlertCircle size={20} />
                      )}
                    </div>

                    {/* Text Content */}
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        {incident.monitor?.friendlyName || "Unknown Monitor"}
                        {!isResolved && (
                          <span className="animate-pulse w-2 h-2 bg-rose-500 rounded-full inline-block"></span>
                        )}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {incident.cause}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        {incident.monitor?.url}
                      </p>
                    </div>
                  </div>

                  {/* Right Side Info */}
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-1 text-[10px] font-bold rounded uppercase mb-1 ${colorClass}`}
                    >
                      {isResolved ? "RESOLVED" : "ONGOING"}
                    </span>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock size={12} />
                        Started{" "}
                        {incident.startedAt
                          ? formatDistanceToNow(new Date(incident.startedAt), {
                              addSuffix: true,
                            })
                          : "-"}
                      </p>
                      {isResolved && incident.duration && (
                        <p className="text-xs text-slate-400">
                          Downtime: {Math.floor(incident.duration / 60)}m{" "}
                          {incident.duration % 60}s
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}