import { useFlightData } from "@/contexts/FlightDataContext";
import { Decision } from "@/types/flight";
import { AlertTriangle, ArrowRight, CheckCircle, Clock, MessageSquare, ThumbsDown, ThumbsUp, XCircle } from "lucide-react";
import { useState } from "react";


interface DecisionReviewTabProps {
  onApprove?: (flightId: string) => void;
}

export default function DecisionReviewTab({ onApprove }: DecisionReviewTabProps) {
  const { decisions, updateDecision, addAuditLog } = useFlightData();
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);

  const handleApprove = (id: string) => {
    const action = "Approved at " + new Date().toLocaleTimeString();
    updateDecision(id, { status: "approved" as const, controllerAction: action });
    addAuditLog({
      type: "decision",
      severity: "info",
      message: `Decision ${id} approved by controller`,
      actor: "Controller",
      details: action,
    });

    // Trigger animation in live queue if callback provided
    if (onApprove) {
      const decision = decisions.find(d => d.id === id);
      if (decision) {
        setTimeout(() => onApprove(decision.flightId), 500);
      }
    }
  };

  const handleReject = (id: string) => {
    const action = "Rejected at " + new Date().toLocaleTimeString();
    updateDecision(id, { status: "rejected" as const, controllerAction: action });
    addAuditLog({
      type: "decision",
      severity: "info",
      message: `Decision ${id} rejected by controller`,
      actor: "Controller",
      details: action,
    });
  };

  const getTypeColor = (type: Decision["type"]) => {
    switch (type) {
      case "alert": return "bg-destructive/20 text-destructive border-destructive/30";
      case "reorder": return "bg-warning/20 text-warning border-warning/30";
      case "hold": return "bg-muted text-muted-foreground border-muted";
      default: return "bg-primary/20 text-primary border-primary/30";
    }
  };

  const getStatusIcon = (status: Decision["status"]) => {
    switch (status) {
      case "approved": return <CheckCircle className="w-5 h-5 text-success" />;
      case "rejected": return <XCircle className="w-5 h-5 text-destructive" />;
      case "escalated": return <AlertTriangle className="w-5 h-5 text-warning animate-pulse" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Decision Queue */}
      <div className="col-span-12 lg:col-span-7">
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Decision Queue</h3>
              <p className="text-xs text-muted-foreground">System recommendations awaiting controller action</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 border border-warning/30 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="text-xs font-medium text-warning">
                  {decisions.filter(d => d.status === "pending" || d.status === "escalated").length} Pending
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {decisions.map((decision) => (
              <div
                key={decision.id}
                onClick={() => setSelectedDecision(decision)}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${selectedDecision?.id === decision.id
                  ? "bg-primary/10 border-primary/50"
                  : decision.status === "escalated"
                    ? "bg-warning/5 border-warning/30 hover:border-warning/50"
                    : "bg-secondary/30 border-transparent hover:border-primary/30"
                  }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(decision.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground">{decision.callsign}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getTypeColor(decision.type)}`}>
                          {decision.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Decision #{decision.id}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{decision.timestamp}</span>
                </div>

                <div className="p-3 bg-secondary/50 rounded-lg mb-3">
                  <p className="text-sm text-foreground">{decision.recommendation}</p>
                </div>

                {decision.quantumCheck && (
                  <div className="flex items-center gap-4 mb-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Current Risk:</span>
                      <span className="font-mono text-warning">{decision.quantumCheck.currentRisk}%</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Optimized:</span>
                      <span className="font-mono text-success">{decision.quantumCheck.optimizedRisk}%</span>
                    </div>
                  </div>
                )}

                {(decision.status === "pending" || decision.status === "escalated") && (
                  <div className="flex gap-2 pt-3 border-t border-white/10">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleApprove(decision.id); }}
                      className="flex-1 py-2.5 bg-success/20 text-success text-sm font-medium rounded-lg 
                                 hover:bg-success/30 transition-all flex items-center justify-center gap-2"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Approve Recommendation
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleReject(decision.id); }}
                      className="flex-1 py-2.5 bg-destructive/20 text-destructive text-sm font-medium rounded-lg 
                                 hover:bg-destructive/30 transition-all flex items-center justify-center gap-2"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}

                {decision.controllerAction && (
                  <div className="pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MessageSquare className="w-4 h-4" />
                      {decision.controllerAction}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decision Details */}
      <div className="col-span-12 lg:col-span-5 space-y-6">
        {selectedDecision ? (
          <>
            {/* Agent Analysis Summary */}
            {selectedDecision.agentAnalysis.length > 0 && (
              <div className="glass-panel p-5">
                <h3 className="text-lg font-semibold text-foreground mb-4">Agent Analysis</h3>
                <div className="space-y-2">
                  {selectedDecision.agentAnalysis.map((agent) => (
                    <div key={agent.agentId} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${agent.result === "safe" ? "bg-success/20" :
                          agent.result === "borderline" ? "bg-warning/20" :
                            "bg-destructive/20"
                          }`}>
                          {agent.result === "safe" ? <CheckCircle className="w-4 h-4 text-success" /> :
                            agent.result === "borderline" ? <AlertTriangle className="w-4 h-4 text-warning" /> :
                              <XCircle className="w-4 h-4 text-destructive" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{agent.name}</p>
                          {agent.reason && (
                            <p className="text-xs text-muted-foreground truncate max-w-48">{agent.reason}</p>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs font-mono ${agent.result === "safe" ? "text-success" :
                        agent.result === "borderline" ? "text-warning" :
                          "text-destructive"
                        }`}>
                        {agent.confidence}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantum Suggestion */}
            {selectedDecision.quantumCheck && (
              <div className="glass-panel p-5">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quantum Suggestion</h3>
                <div className="p-4 bg-gradient-to-r from-purple-500/10 to-primary/10 border border-primary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-3">Suggested Order</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedDecision.quantumCheck.suggestedOrder.map((callsign, idx) => (
                      <div key={callsign} className="flex items-center gap-2">
                        <span className="px-3 py-1.5 bg-primary/20 text-primary font-mono text-sm rounded-lg">
                          {idx + 1}. {callsign}
                        </span>
                        {idx < selectedDecision.quantumCheck!.suggestedOrder.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex-1 text-center p-2 bg-warning/10 rounded">
                      <p className="text-2xl font-bold text-warning">{selectedDecision.quantumCheck.currentRisk}%</p>
                      <p className="text-xs text-muted-foreground">Current</p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-success" />
                    <div className="flex-1 text-center p-2 bg-success/10 rounded">
                      <p className="text-2xl font-bold text-success">{selectedDecision.quantumCheck.optimizedRisk}%</p>
                      <p className="text-xs text-muted-foreground">Optimized</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="glass-panel p-5">
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              Select a decision to view details
            </div>
          </div>
        )}

        {/* Human-in-Loop Reminder */}
        <div className="glass-panel p-4 border-l-4 border-success">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Human-in-Loop Control</p>
              <p className="text-xs text-muted-foreground mt-1">
                All recommendations require controller approval. System never auto-executes decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
