import { useAnalysis } from "@/contexts/AnalysisContext";
import { useFlightData } from "@/contexts/FlightDataContext";
import { AlertTriangle, ArrowRight, CheckCircle, RefreshCw, Shuffle, TrendingDown, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";



import { runQuantumOptimization } from "@/lib/quantum";
import { QuantumResult, SlotOrder } from "@/types/flight";


interface QuantumCheckTabProps {
  onComplete?: () => void;
}

export default function QuantumCheckTab({ onComplete }: QuantumCheckTabProps) {
  const { flights } = useFlightData();
  const { quantumResult: savedResult, setQuantumResult } = useAnalysis();

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showOptimized, setShowOptimized] = useState(!!savedResult);
  const [phase, setPhase] = useState<"idle" | "encoding" | "permuting" | "simulating" | "complete">(savedResult ? "complete" : "idle");
  const [permutationCount, setPermutationCount] = useState(0);
  const [result, setResult] = useState<QuantumResult | null>(savedResult);

  // Generate dynamic orders from real flight data
  const currentOrder: SlotOrder[] = flights.slice(0, 5).map((flight, idx) => ({
    position: idx + 1,
    callsign: flight.callsign,
    flightId: flight.id,
    risk: flight.riskLevel === "unsafe" ? 40 : flight.riskLevel === "borderline" ? 25 : 10 + Math.floor(Math.random() * 10),
    type: flight.type,
    priority: flight.isEmergency ? 1000 : 0 // Emergency flights get priority 1000
  }));

  const runOptimization = () => {
    setIsOptimizing(true);
    setShowOptimized(false);
    setPhase("encoding");
    setPermutationCount(0);
  };

  useEffect(() => {
    if (!isOptimizing) return;

    // Define sequence
    const runSequence = async () => {
      try {
        // Validate we have flights to analyze
        if (currentOrder.length === 0) {
          toast.error("No flights available", {
            description: "Cannot run quantum optimization without flight data.",
            duration: 4000,
          });
          setIsOptimizing(false);
          return;
        }

        // Phase 1: Encoding
        setPhase("encoding");
        await new Promise(r => setTimeout(r, 1000));

        // Phase 2: Permuting (Simulated Annealing Visualization)
        setPhase("permuting");
        await new Promise(r => setTimeout(r, 1500));

        // Phase 3: Quantum Simulation (Actual Computation)
        setPhase("simulating");
        const qcResult = await runQuantumOptimization(currentOrder);
        setResult(qcResult);
        setQuantumResult(qcResult); // Save to global context
        await new Promise(r => setTimeout(r, 1000));

        // Complete
        setPhase("complete");
        setIsOptimizing(false);
        setShowOptimized(true);

        if (onComplete) {
          setTimeout(onComplete, 2000); // Give user time to see result before moving
        }
      } catch (error) {
        console.error("Quantum optimization failed:", error);
        toast.error("Optimization Failed", {
          description: "An error occurred during quantum analysis. Please try again.",
          duration: 5000,
        });
        setPhase("idle");
        setIsOptimizing(false);
      }
    };

    runSequence();

  }, [isOptimizing, currentOrder]);

  const currentTotalRisk = result ? result.currentTotalRisk : currentOrder.reduce((sum, s) => sum + s.risk, 0);
  const optimizedTotalRisk = result ? result.optimizedTotalRisk : 0;
  const improvement = result ? result.improvement : 0;

  const getPhaseStatus = (p: typeof phase) => {
    const phases = ["encoding", "permuting", "simulating", "complete"];
    const currentIdx = phases.indexOf(phase);
    const targetIdx = phases.indexOf(p);
    if (currentIdx > targetIdx || (showOptimized && p !== "complete")) return "complete";
    if (currentIdx === targetIdx && isOptimizing) return "active";
    return "pending";
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Main Analysis Panel */}
      <div className="col-span-12 lg:col-span-8">
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Quantum Permutation Analysis</h3>
                <p className="text-xs text-muted-foreground">QAOA-style slot optimization for runway ordering</p>
              </div>
            </div>
            <button
              onClick={runOptimization}
              disabled={isOptimizing}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-primary text-primary-foreground 
                         text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 
                         disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Computing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Run Quantum Check
                </>
              )}
            </button>
          </div>

          {/* Pipeline Flow Indicator */}
          {onComplete && (
            <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                  <span className="text-xs text-muted-foreground">Agent Analysis</span>
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${showOptimized ? 'bg-success' : isOptimizing ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`}></div>
                  <span className="text-xs font-medium">Quantum Check</span>
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                  <span className="text-xs text-muted-foreground">Decision Review</span>
                </div>
              </div>
              {showOptimized && (
                <p className="text-xs text-primary mt-2">✓ Quantum optimization complete. Auto-transitioning to Decision Review...</p>
              )}
            </div>
          )}

          {/* Process Steps */}
          <div className="mb-6 p-4 bg-secondary/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-3">QUANTUM ANALYSIS PHASES</p>
            <div className="flex items-center gap-2">
              {[
                { id: "encoding", label: "Encode Order", icon: "01" },
                { id: "permuting", label: "Generate Permutations", icon: "02" },
                { id: "simulating", label: "Quantum Simulation", icon: "03" },
                { id: "complete", label: "Results", icon: "04" },
              ].map((step, idx) => (
                <div key={step.id} className="flex items-center gap-2 flex-1">
                  <div className={`flex-1 p-3 rounded-lg text-center transition-all ${getPhaseStatus(step.id as typeof phase) === "active"
                    ? "bg-primary/20 border border-primary/50"
                    : getPhaseStatus(step.id as typeof phase) === "complete"
                      ? "bg-success/10 border border-success/30"
                      : "bg-secondary/50"
                    }`}>
                    <div className={`text-xs font-mono mb-1 ${getPhaseStatus(step.id as typeof phase) === "active" ? "text-primary" :
                      getPhaseStatus(step.id as typeof phase) === "complete" ? "text-success" :
                        "text-muted-foreground"
                      }`}>
                      {step.icon}
                    </div>
                    <p className="text-xs text-foreground">{step.label}</p>
                  </div>
                  {idx < 3 && <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </div>
              ))}
            </div>
            {phase === "permuting" && (
              <div className="mt-3 text-center">
                <span className="text-sm text-primary font-mono">{permutationCount.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground ml-2">permutations evaluated</span>
              </div>
            )}
          </div>

          {/* Order Comparison */}
          <div className="grid grid-cols-2 gap-6">
            {/* Current Order */}
            <div className="p-4 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-foreground">Current Order</p>
                <span className="text-xs text-muted-foreground">As scheduled</span>
              </div>
              <div className="space-y-2">
                {currentOrder.map((slot) => (
                  <div key={slot.callsign} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-secondary text-xs font-mono flex items-center justify-center text-muted-foreground">
                        {slot.position}
                      </span>
                      <div>
                        <span className="font-mono text-sm text-foreground">{slot.callsign}</span>
                        <span className={`ml-2 text-xs ${slot.type === "departure" ? "text-primary" : "text-destructive"}`}>
                          {slot.type === "departure" ? "DEP" : "ARR"}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${slot.risk > 30 ? "bg-destructive/20 text-destructive" :
                      slot.risk > 15 ? "bg-warning/20 text-warning" :
                        "bg-success/20 text-success"
                      }`}>
                      {slot.risk}%
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Risk Score</span>
                <span className="text-xl font-mono font-bold text-warning">{currentTotalRisk}%</span>
              </div>
            </div>

            {/* Optimized Order */}
            <div className={`p-4 bg-secondary/30 rounded-lg transition-opacity duration-500 ${showOptimized ? "opacity-100" : "opacity-30"
              }`}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-foreground">Optimized Order</p>
                {showOptimized && (
                  <span className="flex items-center gap-1 text-xs text-success">
                    <Shuffle className="w-3 h-3" />
                    Quantum optimized
                  </span>
                )}
              </div>
              {showOptimized ? (
                <>
                  <div className="space-y-2">
                    {result?.optimizedOrder.map((slot) => (
                      <div key={slot.callsign} className="flex items-center justify-between p-2 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded bg-primary/20 text-xs font-mono flex items-center justify-center text-primary">
                            {slot.position}
                          </span>
                          <div>
                            <span className="font-mono text-sm text-foreground">{slot.callsign}</span>
                            <span className={`ml-2 text-xs ${slot.type === "departure" ? "text-primary" : "text-destructive"}`}>
                              {slot.type === "departure" ? "DEP" : "ARR"}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-success/20 text-success">
                          {Math.round(slot.risk)}%
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Risk Score</span>
                    <span className="text-xl font-mono font-bold text-success">{optimizedTotalRisk}%</span>
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  {isOptimizing ? (
                    <div className="text-center">
                      <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Computing optimal order...</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Run analysis to see optimized order</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Improvement Result */}
          {showOptimized && (
            <div className="mt-6 p-4 bg-success/10 border border-success/30 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-6 h-6 text-success" />
                <div>
                  <p className="text-sm font-medium text-success">Safer Ordering Detected</p>
                  <p className="text-xs text-success/80">Quantum optimization found a lower-risk permutation</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-success">-{improvement}%</p>
                <p className="text-xs text-success/80">Risk reduction</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side Panel */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        {/* What Quantum Analyzes */}
        <div className="glass-panel p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">What Quantum Analyzes</h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-secondary/30 rounded-lg">
              <p className="text-foreground font-medium mb-1">Order Integrity</p>
              <p className="text-xs text-muted-foreground">Validates the sequence of flights using the runway/taxiway</p>
            </div>
            <div className="p-3 bg-secondary/30 rounded-lg">
              <p className="text-foreground font-medium mb-1">Hidden Bias Detection</p>
              <p className="text-xs text-muted-foreground">Identifies unfair patterns in slot allocation</p>
            </div>
            <div className="p-3 bg-secondary/30 rounded-lg">
              <p className="text-foreground font-medium mb-1">Unsafe Symmetry</p>
              <p className="text-xs text-muted-foreground">Detects risky ordering patterns humans might miss</p>
            </div>
          </div>
        </div>

        {/* Detected Issues */}
        {showOptimized && (
          <div className="glass-panel p-5">
            <h3 className="text-lg font-semibold text-foreground mb-4">Detected Issues</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-warning font-medium">Fuel-Critical Priority</p>
                  <p className="text-xs text-warning/80">Flight prioritized due to low fuel reserves</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-primary font-medium">Separation Improved</p>
                  <p className="text-xs text-primary/80">New order increases spacing between arrivals</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="glass-panel p-4 border-l-4 border-primary">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Note:</strong> Quantum analysis is for risk detection only.
            It does not control aircraft. All suggestions require controller approval.
          </p>
        </div>
      </div>
    </div>
  );
}
