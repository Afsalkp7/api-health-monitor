// 1. Monitor List Item (For the Table)
export interface MonitorListItem {
  id: string;
  name: string;
  environment: string; // e.g., "Production", "Staging"
  isActive: boolean;
  status: "UP" | "DOWN" | "MAINTENANCE";
  method: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  currentLatency: number; // in ms
  uptime7d: number[];     // Array of last ~20 latency checks for the sparkline
  lastChecked: string;    // ISO Date
}

// 2. Incident Item (For Dashboard "Recent Incidents")
export interface IncidentItem {
  id: string;
  monitorName: string;
  issue: string;          // e.g., "Connection timeout"
  severity: "CRITICAL" | "DEGRADED" | "WARNING";
  startedAt: string;      // ISO Date
  resolvedIn?: string;    // e.g., "8m" or null if active
}

// 3. Dashboard Stats (aggregated)
export interface DashboardStats {
  globalUptime: number;   
  avgLatency: number;     
  activeMonitors: number; 
  totalMonitors: number;  
  latencyHistory: {       
    time: string;         
    value: number;        
  }[];
}