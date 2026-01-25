import { CheckCircle2, Zap, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function DashboardOverviewPage() {
  return (
    <DashboardLayout title="Dashboard Overview">
    <div className="p-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Uptime */}
        <div className="bg-white dark:bg-[#161b22] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Global Uptime</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">99.98%</h3>
            </div>
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <CheckCircle2 size={24} />
            </div>
          </div>
          <div className="h-12 w-full mt-2 text-emerald-500">
             <svg viewBox="0 0 100 30" className="w-full h-full stroke-current fill-none" preserveAspectRatio="none">
               <path d="M0 25 Q10 20, 20 22 T40 15 T60 18 T80 5 T100 8" strokeWidth="2" />
             </svg>
          </div>
        </div>

        {/* Card 2: Latency */}
        <div className="bg-white dark:bg-[#161b22] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Latency</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">42ms</h3>
            </div>
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
              <Zap size={24} />
            </div>
          </div>
           <div className="h-12 w-full mt-2 text-purple-500">
             <svg viewBox="0 0 100 30" className="w-full h-full stroke-current fill-none" preserveAspectRatio="none">
               <path d="M0 10 Q15 25, 30 15 T60 20 T100 12" strokeWidth="2" />
             </svg>
          </div>
          {/* Removed "Across all 12 regions" */}
          <p className="text-xs text-slate-400 mt-2">Average across all monitors</p>
        </div>

        {/* Card 3: Active Monitors */}
        <div className="bg-white dark:bg-[#161b22] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Monitors</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">124 / 150</h3>
              <p className="text-xs text-slate-400 mt-2">82% capacity used</p>
           </div>
           <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle className="stroke-slate-800" cx="18" cy="18" r="16" fill="none" strokeWidth="3"></circle>
                <circle className="stroke-blue-500" cx="18" cy="18" r="16" fill="none" strokeWidth="3" strokeDasharray="82, 100"></circle>
              </svg>
              <span className="absolute text-xs font-bold text-blue-500">82%</span>
           </div>
        </div>
      </div>

      {/* Incident History List */}
      <div className="bg-white dark:bg-[#161b22] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
           <AlertCircle className="text-rose-500" size={20} /> Recent Incidents
        </h2>
        
        <div className="space-y-4">
          {/* Incident Item 1 - Region Removed */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                   <AlertCircle size={20} />
                </div>
                <div>
                   <h4 className="font-semibold text-slate-900 dark:text-white">Checkout API</h4>
                   <p className="text-sm text-slate-500 dark:text-slate-400">Connection timeout from internal gateway</p>
                </div>
             </div>
             <div className="text-right">
                <span className="inline-block px-2 py-1 text-[10px] font-bold bg-rose-500/10 text-rose-500 rounded uppercase mb-1">CRITICAL</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">24m ago • Resolved in 8m</p>
             </div>
          </div>
          
           {/* Incident Item 2 - Region Removed */}
           <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                   <AlertCircle size={20} />
                </div>
                <div>
                   <h4 className="font-semibold text-slate-900 dark:text-white">Main Dashboard</h4>
                   <p className="text-sm text-slate-500 dark:text-slate-400">DNS propagation delay causing 404s</p>
                </div>
             </div>
             <div className="text-right">
                <span className="inline-block px-2 py-1 text-[10px] font-bold bg-amber-500/10 text-amber-500 rounded uppercase mb-1">WARNING</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">1d ago • Resolved in 45m</p>
             </div>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}