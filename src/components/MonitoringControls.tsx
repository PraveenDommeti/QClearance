import { useState } from "react";
import { Settings, Cloud, Users, Clock, Play, Pause, AlertTriangle } from "lucide-react";
import { useFlightData } from "@/contexts/FlightDataContext";

export default function MonitoringControls() {
  const {
    monitoringEnabled,
    setMonitoringEnabled,
    injectCongestion,
    injectWeatherChange,
    congestionLevel,
    weatherCondition,
    flights,
    conflicts,
    liveDataEnabled,
    setLiveDataEnabled,
  } = useFlightData();

  const [showControls, setShowControls] = useState(false);

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">System Controls</h3>
        </div>
        <button
          onClick={() => setShowControls(!showControls)}
          className="px-3 py-1.5 bg-secondary text-foreground text-xs font-medium rounded-lg hover:bg-secondary/80 transition-all"
        >
          {showControls ? "Hide" : "Show"} Controls
        </button>
      </div>

      {showControls && (
        <div className="space-y-4">
          {/* Live Data Toggle */}
          <div className="p-3 bg-secondary/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {liveDataEnabled ? (
                  <Play className="w-4 h-4 text-success" />
                ) : (
                  <Pause className="w-4 h-4 text-warning" />
                )}
                <span className="text-sm font-medium text-foreground">Live Data Stream</span>
              </div>
              <button
                onClick={() => setLiveDataEnabled(!liveDataEnabled)}
                className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                  liveDataEnabled
                    ? "bg-success/20 text-success border border-success/30"
                    : "bg-secondary text-muted-foreground border border-white/10"
                }`}
              >
                {liveDataEnabled ? "LIVE" : "PAUSED"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {liveDataEnabled ? "Data updates every 5 seconds, new flights may arrive" : "Data stream paused"}
            </p>
          </div>

          {/* Monitoring Toggle */}
          <div className="p-3 bg-secondary/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {monitoringEnabled ? (
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                )}
                <span className="text-sm font-medium text-foreground">Continuous Monitoring</span>
              </div>
              <button
                onClick={() => setMonitoringEnabled(!monitoringEnabled)}
                className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                  monitoringEnabled
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-secondary text-muted-foreground border border-white/10"
                }`}
              >
                {monitoringEnabled ? "ACTIVE" : "DISABLED"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {monitoringEnabled ? "Re-evaluating clearances every 8 seconds" : "Monitoring disabled"}
            </p>
          </div>

          {/* Weather Injection */}
          <div className="p-3 bg-secondary/30 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Cloud className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Weather Condition</span>
              <span className="ml-auto text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                {weatherCondition}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {["VFR", "MVFR", "IFR", "LIFR"].map((condition) => (
                <button
                  key={condition}
                  onClick={() => injectWeatherChange(condition)}
                  className={`px-2 py-1.5 text-xs font-medium rounded transition-all ${
                    weatherCondition === condition
                      ? condition === "IFR" || condition === "LIFR"
                        ? "bg-destructive/20 text-destructive border border-destructive/30"
                        : "bg-primary/20 text-primary border border-primary/30"
                      : "bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent hover:border-primary/20"
                  }`}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>

          {/* Congestion Injection */}
          <div className="p-3 bg-secondary/30 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Congestion Level</span>
              <span className="ml-auto text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                {congestionLevel.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { level: "low", label: "Low" },
                { level: "moderate", label: "Moderate" },
                { level: "high", label: "High" },
              ].map(({ level, label }) => (
                <button
                  key={level}
                  onClick={() => injectCongestion(level as "low" | "moderate" | "high")}
                  className={`px-2 py-1.5 text-xs font-medium rounded transition-all ${
                    congestionLevel === level
                      ? level === "high"
                        ? "bg-warning/20 text-warning border border-warning/30"
                        : "bg-primary/20 text-primary border border-primary/30"
                      : "bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent hover:border-primary/20"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Conflicts */}
          {conflicts.length > 0 && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-destructive animate-pulse" />
                <span className="text-sm font-medium text-destructive">Active Conflicts: {conflicts.length}</span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {conflicts.map((conflict) => (
                  <div key={conflict.id} className="text-xs text-destructive/90 bg-destructive/5 p-2 rounded">
                    {conflict.description}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-secondary/30 rounded-lg text-center">
              <p className="text-2xl font-bold text-foreground">{flights.length}</p>
              <p className="text-xs text-muted-foreground">Active Flights</p>
            </div>
            <div className="p-3 bg-secondary/30 rounded-lg text-center">
              <p className="text-2xl font-bold text-primary">{conflicts.length}</p>
              <p className="text-xs text-muted-foreground">Conflicts</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
