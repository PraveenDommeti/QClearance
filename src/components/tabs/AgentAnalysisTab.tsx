import { useAnalysis } from "@/contexts/AnalysisContext";
import { useFlightData } from "@/contexts/FlightDataContext";
import { analyzeFlightWithAI } from "@/lib/ai";
import { sortFlightsByPriority } from "@/lib/slotWindow";
import { AgentResult, Flight } from "@/types/flight";
import { AlertTriangle, CheckCircle, Cloud, Fuel, Play, RotateCcw, Scale, Shield, Users, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface AgentAnalysisTabProps {
  flight?: Flight;
  onComplete?: () => void;
  autoStart?: boolean; // Auto-start analysis when component mounts
}

const agentConfigs = [
  { id: "fuel", name: "Fuel Agent", icon: Fuel, description: "Analyzes fuel reserves and flight duration requirements" },
  { id: "weather", name: "Weather Agent", icon: Cloud, description: "Evaluates weather conditions and visibility" },
  { id: "congestion", name: "Congestion Agent", icon: Users, description: "Monitors taxiway and runway traffic density" },
  { id: "safety", name: "Safety Agent", icon: Shield, description: "Checks separation standards and conflict detection" },
  { id: "fairness", name: "Fairness Agent", icon: Scale, description: "Ensures equitable slot distribution and wait times" },
] as const;

export default function AgentAnalysisTab({ flight, onComplete, autoStart = false }: AgentAnalysisTabProps) {
  const { agentResults: savedResults, setAgentResults, clearAnalysis } = useAnalysis();
  const { flights } = useFlightData();

  // Get flights for batch analysis (prioritize emergency, then by fuel/risk)
  // Use useMemo to prevent unnecessary recalculations
  const analysisFlights = useMemo(() => {
    if (flight) return [flight];
    const batchFlights = sortFlightsByPriority(flights.slice(0, 6)); // Analyze up to 6 flights
    console.log(`[ANALYSIS FLIGHTS] Calculated batch of ${batchFlights.length} flights:`, batchFlights.map(f => f.callsign));
    return batchFlights;
  }, [flight, flights]);

  const [agents, setAgents] = useState<AgentResult[]>(
    savedResults || agentConfigs.map(a => ({ agentId: a.id, name: a.name, status: "pending" }))
  );
  const [currentAgent, setCurrentAgent] = useState(-1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(!!savedResults);
  const [batchResults, setBatchResults] = useState<Map<string, AgentResult[]>>(new Map());

  const startAnalysis = useCallback(() => {
    console.log(`[START ANALYSIS] Button clicked! Starting batch analysis for ${analysisFlights.length} flights`);
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setAgents(agentConfigs.map(a => ({ agentId: a.id, name: a.name, status: "pending" })));
    setBatchResults(new Map());
    setCurrentAgent(0);
  }, [analysisFlights.length]);

  const resetAnalysis = () => {
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setCurrentAgent(-1);
    setAgents(agentConfigs.map(a => ({ agentId: a.id, name: a.name, status: "pending" })));
    clearAnalysis(); // Clear from global context
  };

  // Auto-start analysis if autoStart prop is true
  useEffect(() => {
    if (autoStart && !isAnalyzing && !analysisComplete && analysisFlights.length > 0) {
      console.log('[AUTO-START] Triggering automatic analysis...');
      setTimeout(() => startAnalysis(), 500); // Small delay for smooth transition
    }
  }, [autoStart, analysisFlights.length]); // Only run when autoStart changes

  useEffect(() => {
    console.log(`[USEEFFECT] Triggered - isAnalyzing: ${isAnalyzing}, currentAgent: ${currentAgent}, agents.length: ${agents.length}`);

    if (!isAnalyzing || currentAgent < 0 || currentAgent >= agents.length) {
      if (currentAgent >= agents.length) {
        console.log(`[USEEFFECT] All agents complete, setting analysis complete`);
        setIsAnalyzing(false);
        setAnalysisComplete(true);
      }
      return;
    }

    // Set current agent to analyzing
    setAgents(prev => prev.map((a, i) => i === currentAgent ? { ...a, status: "analyzing" } : a));

    let isMounted = true;

    // Perform BATCH AI analysis for all flights
    const performBatchAnalysis = async () => {
      const agentType = agents[currentAgent].agentId as any;

      console.log(`[BATCH ANALYSIS] Starting ${agentType} agent for ${analysisFlights.length} flights`);

      // Analyze ALL flights in the batch
      const flightResults: AgentResult[] = [];
      let worstResult: "safe" | "borderline" | "unsafe" = "safe";
      let totalConfidence = 0;
      const reasons: string[] = [];

      try {
        for (let i = 0; i < analysisFlights.length; i++) {
          const targetFlight = analysisFlights[i];
          console.log(`[BATCH ANALYSIS] ${agentType} analyzing flight ${i + 1}/${analysisFlights.length}: ${targetFlight.callsign}`);

          const result = await analyzeFlightWithAI(targetFlight, agentType);
          flightResults.push(result);

          console.log(`[BATCH ANALYSIS] ${agentType} completed ${targetFlight.callsign}: ${result.result} (${result.confidence}%)`);

          // Track worst-case scenario
          if (result.result === "unsafe") worstResult = "unsafe";
          else if (result.result === "borderline" && worstResult === "safe") worstResult = "borderline";

          totalConfidence += result.confidence || 0;

          // Collect reasons, especially for emergency flights
          if (targetFlight.isEmergency) {
            reasons.unshift(`🚨 EMERGENCY: ${targetFlight.callsign} - ${result.reason}`);
          } else if (result.result !== "safe") {
            reasons.push(`${targetFlight.callsign}: ${result.reason}`);
          }
        }

        // Aggregate results
        const aggregatedResult: AgentResult = {
          agentId: agentType,
          name: agents[currentAgent].name,
          status: "complete",
          result: worstResult,
          confidence: Math.round(totalConfidence / analysisFlights.length),
          reason: reasons.length > 0
            ? `Analyzed ${analysisFlights.length} flights. ${reasons.join("; ")}`
            : `All ${analysisFlights.length} flights cleared by ${agents[currentAgent].name}.`,
          timestamp: new Date().toISOString(),
        };

        console.log(`[BATCH ANALYSIS] ${agentType} agent complete. Overall: ${worstResult} (${aggregatedResult.confidence}%)`);

        if (isMounted) {
          setAgents(prev => prev.map((a, i) =>
            i === currentAgent ? aggregatedResult : a
          ));

          // Store individual flight results
          setBatchResults(prev => {
            const newMap = new Map(prev);
            newMap.set(agentType, flightResults);
            return newMap;
          });

          setCurrentAgent(c => c + 1);

          // If last agent, trigger complete
          if (currentAgent === agents.length - 1) {
            setAnalysisComplete(true);
            setIsAnalyzing(false);

            // Save to global context
            const finalResults = [...agents.slice(0, currentAgent), aggregatedResult, ...agents.slice(currentAgent + 1)];
            setAgentResults(finalResults);

            console.log(`[BATCH ANALYSIS] All agents complete! Transitioning in 1.5s...`);

            if (onComplete) {
              setTimeout(onComplete, 1500); // Wait a bit before transitioning
            }
          }
        }
      } catch (error) {
        console.error(`[BATCH ANALYSIS ERROR] ${agentType} agent failed:`, error);

        // Create error result
        const errorResult: AgentResult = {
          agentId: agentType,
          name: agents[currentAgent].name,
          status: "complete",
          result: "borderline",
          confidence: 50,
          reason: `Analysis error occurred. Using fallback assessment.`,
          timestamp: new Date().toISOString(),
        };

        if (isMounted) {
          setAgents(prev => prev.map((a, i) =>
            i === currentAgent ? errorResult : a
          ));
          setCurrentAgent(c => c + 1);
        }
      }
    };

    performBatchAnalysis();

    return () => { isMounted = false; };
  }, [isAnalyzing, currentAgent]); // Simplified dependencies - only trigger when these change

  const getOverallStatus = () => {
    if (!analysisComplete) return null;
    const hasUnsafe = agents.some(a => a.result === "unsafe");
    const hasBorderline = agents.some(a => a.result === "borderline");
    if (hasUnsafe) return "unsafe";
    if (hasBorderline) return "borderline";
    return "safe";
  };

  const progress = (agents.filter(a => a.status === "complete").length / agents.length) * 100;
  const overallStatus = getOverallStatus();

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Agent List */}
      <div className="col-span-12 lg:col-span-7">
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Sequential Agent Analysis</h3>
              <p className="text-xs text-muted-foreground">Step-by-step clearance verification</p>
            </div>
            <div className="flex gap-2">
              {!isAnalyzing && !analysisComplete && (
                <button
                  onClick={startAnalysis}
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg 
                             hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg"
                >
                  <Play className="w-4 h-4" />
                  Start Analysis
                </button>
              )}
              {(isAnalyzing || analysisComplete) && (
                <button
                  onClick={resetAnalysis}
                  className="px-4 py-2 bg-secondary text-foreground text-sm font-medium rounded-lg 
                             hover:bg-secondary/80 transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Pipeline Flow Indicator */}
          {onComplete && (
            <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${analysisComplete ? 'bg-success' : isAnalyzing ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`}></div>
                  <span className="text-xs font-medium">Agent Analysis</span>
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                  <span className="text-xs text-muted-foreground">Quantum Check</span>
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                  <span className="text-xs text-muted-foreground">Decision Review</span>
                </div>
              </div>
              {analysisComplete && (
                <p className="text-xs text-primary mt-2">✓ Analysis complete. Auto-transitioning to Quantum Optimization...</p>
              )}
              {autoStart && isAnalyzing && (
                <p className="text-xs text-warning mt-2">⚡ Auto-started by continuous monitoring system</p>
              )}
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">Analysis Progress</span>
              <span className="font-mono text-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Agent Cards */}
          <div className="space-y-3">
            {agents.map((agent, idx) => {
              const config = agentConfigs[idx];
              const Icon = config.icon;
              const isActive = idx === currentAgent && isAnalyzing;
              const isComplete = agent.status === "complete";
              const isPending = agent.status === "pending";

              return (
                <div
                  key={agent.agentId}
                  className={`p-4 rounded-lg border transition-all duration-500 ${isActive
                    ? "bg-primary/10 border-primary/50 shadow-lg shadow-primary/10"
                    : isComplete
                      ? "bg-secondary/30 border-white/10"
                      : "bg-secondary/10 border-transparent opacity-50"
                    }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isActive
                      ? "bg-primary text-primary-foreground animate-pulse"
                      : isComplete
                        ? agent.result === "safe" ? "bg-success/20 text-success" :
                          agent.result === "borderline" ? "bg-warning/20 text-warning" :
                            "bg-destructive/20 text-destructive"
                        : "bg-secondary text-muted-foreground"
                      }`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-foreground">{agent.name}</h4>
                        {isActive && (
                          <div className="flex items-center gap-2 text-primary text-xs">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            Analyzing...
                          </div>
                        )}
                        {isComplete && (
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-mono ${agent.result === "safe" ? "text-success" :
                              agent.result === "borderline" ? "text-warning" :
                                "text-destructive"
                              }`}>
                              {agent.confidence}%
                            </span>
                            {agent.result === "safe" ? <CheckCircle className="w-4 h-4 text-success" /> :
                              agent.result === "borderline" ? <AlertTriangle className="w-4 h-4 text-warning" /> :
                                <XCircle className="w-4 h-4 text-destructive" />}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mb-2">{config.description}</p>

                      {isComplete && agent.reason && (
                        <div className={`p-3 rounded-lg text-xs ${agent.result === "safe" ? "bg-success/10 text-success/90" :
                          agent.result === "borderline" ? "bg-warning/10 text-warning/90" :
                            "bg-destructive/10 text-destructive/90"
                          }`}>
                          {agent.reason}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Panel */}
      <div className="col-span-12 lg:col-span-5 space-y-6">
        {/* Overall Status */}
        <div className="glass-panel p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">Analysis Summary</h3>

          {analysisComplete ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${overallStatus === "safe" ? "status-safe" :
                overallStatus === "borderline" ? "status-warning" :
                  "status-danger"
                }`}>
                <div className="flex items-center gap-3">
                  {overallStatus === "safe" ? <CheckCircle className="w-8 h-8" /> :
                    overallStatus === "borderline" ? <AlertTriangle className="w-8 h-8" /> :
                      <XCircle className="w-8 h-8" />}
                  <div>
                    <p className="text-lg font-bold uppercase">{overallStatus}</p>
                    <p className="text-xs opacity-80">Overall clearance assessment</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {agents.map(agent => (
                  <div key={agent.agentId} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-sm text-muted-foreground">{agent.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono ${agent.result === "safe" ? "text-success" :
                        agent.result === "borderline" ? "text-warning" :
                          "text-destructive"
                        }`}>
                        {agent.confidence}%
                      </span>
                      <span className={`w-2 h-2 rounded-full ${agent.result === "safe" ? "bg-success" :
                        agent.result === "borderline" ? "bg-warning" :
                          "bg-destructive"
                        }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              {isAnalyzing ? "Analysis in progress..." : "Start analysis to see results"}
            </div>
          )}
        </div>

        {/* Flight Context */}
        <div className="glass-panel p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {flight ? "Flight Context" : "Batch Analysis"}
          </h3>
          <div className="space-y-3">
            {flight ? (
              <>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-muted-foreground">Callsign</span>
                  <span className="font-mono text-foreground">{flight.callsign}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-muted-foreground">Request Type</span>
                  <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded">{flight.type.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-muted-foreground">Runway</span>
                  <span className="font-mono text-foreground">{flight.runway}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-muted-foreground">Flights Analyzed</span>
                  <span className="font-mono text-foreground font-bold">{analysisFlights.length}</span>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {analysisFlights.map((f, idx) => (
                    <div key={f.id} className="flex items-center justify-between py-1.5 px-2 bg-secondary/20 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">#{idx + 1}</span>
                        <span className="text-xs font-mono text-foreground font-bold">{f.callsign}</span>
                        {f.isEmergency && (
                          <span className="px-1.5 py-0.5 bg-destructive/20 text-destructive text-xs rounded">EMG</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{f.type}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Analysis Time</span>
              <span className="font-mono text-foreground">~{analysisFlights.length * 2}s total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
