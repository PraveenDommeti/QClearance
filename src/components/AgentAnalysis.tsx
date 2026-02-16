import { useEffect, useState } from "react";
import { Fuel, Cloud, Users, Shield, Scale, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: "pending" | "analyzing" | "complete";
  result?: "safe" | "borderline" | "unsafe";
  reason?: string;
}

const initialAgents: Agent[] = [
  { id: "fuel", name: "Fuel Agent", icon: <Fuel className="w-4 h-4" />, status: "pending" },
  { id: "weather", name: "Weather Agent", icon: <Cloud className="w-4 h-4" />, status: "pending" },
  { id: "congestion", name: "Congestion Agent", icon: <Users className="w-4 h-4" />, status: "pending" },
  { id: "safety", name: "Safety Agent", icon: <Shield className="w-4 h-4" />, status: "pending" },
  { id: "fairness", name: "Fairness Agent", icon: <Scale className="w-4 h-4" />, status: "pending" },
];

const mockResults: Record<string, { result: "safe" | "borderline" | "unsafe"; reason: string }> = {
  fuel: { result: "safe", reason: "Fuel reserves at 85%, sufficient for flight + 45min reserve" },
  weather: { result: "safe", reason: "VFR conditions, visibility 10km, wind 12kts" },
  congestion: { result: "borderline", reason: "Moderate traffic on taxiway, 3 aircraft queued" },
  safety: { result: "safe", reason: "Separation standards met, no conflicts detected" },
  fairness: { result: "safe", reason: "Wait time within acceptable limits (8 min)" },
};

export default function AgentAnalysis() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [currentAgent, setCurrentAgent] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setAgents(initialAgents);
    setCurrentAgent(0);
  };

  useEffect(() => {
    if (!isAnalyzing || currentAgent >= agents.length) {
      if (currentAgent >= agents.length) setIsAnalyzing(false);
      return;
    }

    // Set current agent to analyzing
    setAgents((prev) =>
      prev.map((a, i) => (i === currentAgent ? { ...a, status: "analyzing" } : a))
    );

    // Complete after delay
    const timer = setTimeout(() => {
      setAgents((prev) =>
        prev.map((a, i) =>
          i === currentAgent
            ? {
                ...a,
                status: "complete",
                result: mockResults[a.id].result,
                reason: mockResults[a.id].reason,
              }
            : a
        )
      );
      setCurrentAgent((c) => c + 1);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAnalyzing, currentAgent, agents.length]);

  const getStatusIcon = (agent: Agent) => {
    if (agent.status === "pending") return null;
    if (agent.status === "analyzing") {
      return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
    }
    if (agent.result === "safe") return <CheckCircle className="w-4 h-4 text-success" />;
    if (agent.result === "borderline") return <AlertTriangle className="w-4 h-4 text-warning" />;
    return <XCircle className="w-4 h-4 text-destructive" />;
  };

  const progress = (agents.filter((a) => a.status === "complete").length / agents.length) * 100;

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Agentic Analysis
          </p>
          <p className="text-sm text-foreground mt-1">Step-by-step clearance verification</p>
        </div>
        <button
          onClick={startAnalysis}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg 
                     hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all
                     shadow-lg hover:shadow-primary/20"
        >
          {isAnalyzing ? "Analyzing..." : "Run Analysis"}
        </button>
      </div>

      {/* Progress bar */}
      <div className="agent-progress mb-4">
        <div className="agent-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {/* Agent list */}
      <div className="space-y-2">
        {agents.map((agent, idx) => (
          <div
            key={agent.id}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
              agent.status === "analyzing"
                ? "bg-primary/10 border border-primary/30"
                : agent.status === "complete"
                ? "bg-secondary/30"
                : "bg-secondary/10 opacity-50"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                agent.status === "analyzing"
                  ? "bg-primary text-primary-foreground"
                  : agent.status === "complete"
                  ? "bg-secondary text-foreground"
                  : "bg-secondary/50 text-muted-foreground"
              }`}
            >
              {agent.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{agent.name}</p>
              {agent.reason && (
                <p className="text-xs text-muted-foreground truncate">{agent.reason}</p>
              )}
            </div>
            <div className="flex-shrink-0">{getStatusIcon(agent)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
