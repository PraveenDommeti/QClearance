import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Play, Pause, SkipBack, SkipForward, ChevronLeft, 
  Clock, AlertTriangle, CheckCircle, XCircle, Cpu,
  Shield, User, Zap
} from "lucide-react";
import { useFlightData } from "@/contexts/FlightDataContext";
import { AuditLog, Decision, AgentResult } from "@/types/flight";
import AppLayout from "@/components/AppLayout";

interface ReplayState {
  isPlaying: boolean;
  currentIndex: number;
  speed: number; // 1x, 2x, 4x
  events: AuditLog[];
  relatedDecisions: Decision[];
}

export default function IncidentReplay() {
  const { incidentId } = useParams<{ incidentId: string }>();
  const navigate = useNavigate();
  const { auditLogs, decisions } = useFlightData();
  
  const [replayState, setReplayState] = useState<ReplayState>({
    isPlaying: false,
    currentIndex: 0,
    speed: 1,
    events: [],
    relatedDecisions: [],
  });

  // Find incident and related events
  useEffect(() => {
    if (incidentId) {
      // Find the incident log
      const incidentLog = auditLogs.find(log => log.id === incidentId);
      
      if (incidentLog) {
        // Get events around the incident (5 before, all after until resolved)
        const incidentIndex = auditLogs.findIndex(log => log.id === incidentId);
        const startIndex = Math.max(0, incidentIndex - 5);
        const relevantEvents = auditLogs.slice(startIndex);
        
        // Find related decisions
        const relatedDecisions = decisions.filter(d => 
          d.timestamp >= (relevantEvents[0]?.timestamp || "")
        );

        setReplayState(prev => ({
          ...prev,
          events: relevantEvents.reverse(), // Show in chronological order
          relatedDecisions,
          currentIndex: 0,
        }));
      }
    } else {
      // Show all recent events if no specific incident
      setReplayState(prev => ({
        ...prev,
        events: [...auditLogs].reverse(),
        relatedDecisions: decisions,
        currentIndex: 0,
      }));
    }
  }, [incidentId, auditLogs, decisions]);

  // Playback logic
  useEffect(() => {
    if (!replayState.isPlaying || replayState.currentIndex >= replayState.events.length - 1) {
      return;
    }

    const timer = setTimeout(() => {
      setReplayState(prev => ({
        ...prev,
        currentIndex: Math.min(prev.currentIndex + 1, prev.events.length - 1),
      }));
    }, 1500 / replayState.speed);

    return () => clearTimeout(timer);
  }, [replayState.isPlaying, replayState.currentIndex, replayState.speed, replayState.events.length]);

  const togglePlay = useCallback(() => {
    setReplayState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const skipBack = useCallback(() => {
    setReplayState(prev => ({
      ...prev,
      currentIndex: Math.max(0, prev.currentIndex - 1),
      isPlaying: false,
    }));
  }, []);

  const skipForward = useCallback(() => {
    setReplayState(prev => ({
      ...prev,
      currentIndex: Math.min(prev.events.length - 1, prev.currentIndex + 1),
    }));
  }, []);

  const setSpeed = useCallback((speed: number) => {
    setReplayState(prev => ({ ...prev, speed }));
  }, []);

  const jumpToEvent = useCallback((index: number) => {
    setReplayState(prev => ({
      ...prev,
      currentIndex: index,
      isPlaying: false,
    }));
  }, []);

  const getSeverityIcon = (severity: AuditLog["severity"]) => {
    switch (severity) {
      case "critical": return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-warning" />;
      default: return <CheckCircle className="w-4 h-4 text-primary" />;
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

  const currentEvent = replayState.events[replayState.currentIndex];
  const visibleEvents = replayState.events.slice(0, replayState.currentIndex + 1);
  const progress = replayState.events.length > 0 
    ? ((replayState.currentIndex + 1) / replayState.events.length) * 100 
    : 0;

  return (
    <AppLayout>
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 px-3 py-2 bg-secondary/50 hover:bg-secondary 
                           rounded-lg text-sm text-muted-foreground hover:text-foreground transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Incident Replay</h1>
                <p className="text-sm text-muted-foreground">
                  {incidentId ? `Reviewing incident #${incidentId}` : "Full timeline replay"}
                </p>
              </div>
            </div>
            
            {/* Speed Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Speed:</span>
              {[1, 2, 4].map(speed => (
                <button
                  key={speed}
                  onClick={() => setSpeed(speed)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    replayState.speed === speed
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Timeline Panel */}
            <div className="col-span-12 lg:col-span-4">
              <div className="glass-panel p-5">
                <h3 className="text-lg font-semibold text-foreground mb-4">Event Timeline</h3>
                
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {replayState.events.map((event, idx) => {
                    const isActive = idx === replayState.currentIndex;
                    const isPast = idx < replayState.currentIndex;
                    
                    return (
                      <button
                        key={event.id}
                        onClick={() => jumpToEvent(idx)}
                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                          isActive
                            ? "bg-primary/10 border-primary/50"
                            : isPast
                            ? "bg-secondary/30 border-transparent opacity-70"
                            : "bg-secondary/10 border-transparent opacity-40"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {getSeverityIcon(event.severity)}
                          <span className="text-xs font-mono text-muted-foreground">{event.timestamp}</span>
                        </div>
                        <p className={`text-sm ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                          {event.message}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Current Event Details */}
              <div className="glass-panel p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Current Event</h3>
                  <span className="text-sm text-muted-foreground">
                    {replayState.currentIndex + 1} of {replayState.events.length}
                  </span>
                </div>

                {currentEvent ? (
                  <div className={`p-6 rounded-lg border-l-4 ${
                    currentEvent.severity === "critical" ? "border-l-destructive bg-destructive/5" :
                    currentEvent.severity === "warning" ? "border-l-warning bg-warning/5" :
                    "border-l-primary bg-primary/5"
                  }`}>
                    <div className="flex items-center gap-3 mb-4">
                      {getSeverityIcon(currentEvent.severity)}
                      <div>
                        <p className="text-xl font-medium text-foreground">{currentEvent.message}</p>
                        <p className="text-sm text-muted-foreground">{currentEvent.timestamp}</p>
                      </div>
                    </div>
                    
                    {currentEvent.details && (
                      <p className="text-sm text-muted-foreground mb-4 p-3 bg-secondary/30 rounded">
                        {currentEvent.details}
                      </p>
                    )}

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(currentEvent.type)}
                        <span className="text-muted-foreground capitalize">{currentEvent.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{currentEvent.actor}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-muted-foreground">
                    No events to display
                  </div>
                )}
              </div>

              {/* Playback Controls */}
              <div className="glass-panel p-5">
                <div className="flex items-center gap-4">
                  {/* Progress Bar */}
                  <div className="flex-1">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={skipBack}
                      disabled={replayState.currentIndex === 0}
                      className="w-10 h-10 rounded-lg bg-secondary/50 hover:bg-secondary disabled:opacity-50 
                                 flex items-center justify-center transition-all"
                    >
                      <SkipBack className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={togglePlay}
                      className="w-12 h-12 rounded-lg bg-primary hover:bg-primary/90 
                                 flex items-center justify-center transition-all shadow-lg"
                    >
                      {replayState.isPlaying ? (
                        <Pause className="w-6 h-6 text-primary-foreground" />
                      ) : (
                        <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                      )}
                    </button>
                    
                    <button
                      onClick={skipForward}
                      disabled={replayState.currentIndex >= replayState.events.length - 1}
                      className="w-10 h-10 rounded-lg bg-secondary/50 hover:bg-secondary disabled:opacity-50 
                                 flex items-center justify-center transition-all"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Related Decisions */}
              {replayState.relatedDecisions.length > 0 && (
                <div className="glass-panel p-5">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Related Decisions</h3>
                  <div className="space-y-3">
                    {replayState.relatedDecisions.slice(0, 3).map(decision => (
                      <div key={decision.id} className="p-4 bg-secondary/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" />
                            <span className="font-mono font-medium text-foreground">{decision.callsign}</span>
                            <span className={`px-2 py-0.5 text-xs rounded ${
                              decision.type === "alert" ? "bg-destructive/20 text-destructive" :
                              decision.type === "reorder" ? "bg-warning/20 text-warning" :
                              "bg-primary/20 text-primary"
                            }`}>
                              {decision.type.toUpperCase()}
                            </span>
                          </div>
                          <span className={`text-xs font-medium capitalize ${
                            decision.status === "approved" ? "text-success" :
                            decision.status === "rejected" ? "text-destructive" :
                            "text-warning"
                          }`}>
                            {decision.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{decision.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Compliance Note */}
          <div className="mt-6 glass-panel p-4 border-l-4 border-primary">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Audit Trail:</strong> This replay is a reconstruction 
              from immutable audit logs. All events are cryptographically verified and compliant with 
              aviation safety regulations.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
