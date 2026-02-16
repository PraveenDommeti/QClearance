import { useState } from "react";
import { Search, Filter, Download, AlertTriangle, Info, AlertCircle, Clock, User, Cpu, Shield } from "lucide-react";
import { AuditLog } from "@/types/flight";
import { useFlightData } from "@/contexts/FlightDataContext";

export default function AuditHistoryTab() {
  const { auditLogs } = useFlightData();
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "info">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = auditLogs.filter((log) => {
    const matchesFilter = filter === "all" || log.severity === filter;
    const matchesSearch = searchQuery === "" || 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getSeverityIcon = (severity: AuditLog["severity"]) => {
    switch (severity) {
      case "critical": return <AlertCircle className="w-4 h-4 text-destructive" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-warning" />;
      default: return <Info className="w-4 h-4 text-primary" />;
    }
  };

  const getSeverityBg = (severity: AuditLog["severity"]) => {
    switch (severity) {
      case "critical": return "border-l-destructive bg-destructive/5";
      case "warning": return "border-l-warning bg-warning/5";
      default: return "border-l-primary bg-primary/5";
    }
  };

  const getTypeIcon = (type: AuditLog["type"]) => {
    switch (type) {
      case "agent": return <Cpu className="w-4 h-4" />;
      case "decision": return <Shield className="w-4 h-4" />;
      case "clearance": return <User className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const stats = {
    total: auditLogs.length,
    critical: auditLogs.filter(l => l.severity === "critical").length,
    warning: auditLogs.filter(l => l.severity === "warning").length,
    info: auditLogs.filter(l => l.severity === "info").length,
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Main Log View */}
      <div className="col-span-12 lg:col-span-8">
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Audit Trail</h3>
              <p className="text-xs text-muted-foreground">Immutable log of all system events and decisions</p>
            </div>
            <button className="px-4 py-2 bg-secondary text-foreground text-sm font-medium rounded-lg 
                               hover:bg-secondary/80 transition-all flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-white/10 rounded-lg 
                           text-sm text-foreground placeholder:text-muted-foreground
                           focus:outline-none focus:border-primary/50"
              />
            </div>
            <div className="flex gap-2">
              {["all", "critical", "warning", "info"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as typeof filter)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-all capitalize ${
                    filter === f
                      ? f === "critical" ? "bg-destructive/20 text-destructive border border-destructive/30" :
                        f === "warning" ? "bg-warning/20 text-warning border border-warning/30" :
                        f === "info" ? "bg-primary/20 text-primary border border-primary/30" :
                        "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Log Entries */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`p-4 rounded-lg border-l-4 ${getSeverityBg(log.severity)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(log.severity)}
                    <div>
                      <p className="text-sm font-medium text-foreground">{log.message}</p>
                      {log.details && (
                        <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{log.timestamp}</span>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {getTypeIcon(log.type)}
                    <span className="capitalize">{log.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>{log.actor}</span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">#{log.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats & Timeline */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        {/* Stats */}
        <div className="glass-panel p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">Event Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-secondary/30 rounded-lg text-center">
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Events</p>
            </div>
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-center">
              <p className="text-3xl font-bold text-destructive">{stats.critical}</p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </div>
            <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg text-center">
              <p className="text-3xl font-bold text-warning">{stats.warning}</p>
              <p className="text-xs text-muted-foreground">Warnings</p>
            </div>
            <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-center">
              <p className="text-3xl font-bold text-primary">{stats.info}</p>
              <p className="text-xs text-muted-foreground">Info</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="glass-panel p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">Event Timeline</h3>
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-white/10" />
              <div className="space-y-4">
                {auditLogs.slice(0, 5).map((log, idx) => (
                <div key={log.id} className="relative pl-8">
                  <div className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-background ${
                    log.severity === "critical" ? "bg-destructive" :
                    log.severity === "warning" ? "bg-warning" :
                    "bg-primary"
                  }`} />
                  <div>
                    <p className="text-xs font-mono text-muted-foreground">{log.timestamp}</p>
                    <p className="text-sm text-foreground">{log.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Compliance Note */}
        <div className="glass-panel p-4 border-l-4 border-primary">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Compliance:</strong> All logs are immutable and cryptographically 
            signed. Full audit trail maintained for regulatory compliance.
          </p>
        </div>
      </div>
    </div>
  );
}
