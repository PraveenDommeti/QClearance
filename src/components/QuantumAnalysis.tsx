import { useState } from "react";
import { Zap, ArrowRight, RefreshCw } from "lucide-react";

interface SlotOrder {
  position: number;
  callsign: string;
  risk: number;
}

const currentOrder: SlotOrder[] = [
  { position: 1, callsign: "TWS127", risk: 12 },
  { position: 2, callsign: "ZET3319", risk: 28 },
  { position: 3, callsign: "ROT234J", risk: 8 },
  { position: 4, callsign: "FNY676", risk: 45 },
];

const optimizedOrder: SlotOrder[] = [
  { position: 1, callsign: "ROT234J", risk: 5 },
  { position: 2, callsign: "TWS127", risk: 10 },
  { position: 3, callsign: "ZET3319", risk: 15 },
  { position: 4, callsign: "FNY676", risk: 22 },
];

export default function QuantumAnalysis() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showOptimized, setShowOptimized] = useState(false);

  const runOptimization = () => {
    setIsOptimizing(true);
    setShowOptimized(false);
    setTimeout(() => {
      setIsOptimizing(false);
      setShowOptimized(true);
    }, 2000);
  };

  const currentTotalRisk = currentOrder.reduce((sum, s) => sum + s.risk, 0);
  const optimizedTotalRisk = optimizedOrder.reduce((sum, s) => sum + s.risk, 0);
  const improvement = Math.round(((currentTotalRisk - optimizedTotalRisk) / currentTotalRisk) * 100);

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Quantum Permutation Check</p>
            <p className="text-xs text-muted-foreground">QAOA-style slot optimization</p>
          </div>
        </div>
        <button
          onClick={runOptimization}
          disabled={isOptimizing}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-primary text-primary-foreground 
                     text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {isOptimizing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Computing...
            </>
          ) : (
            "Run Quantum Check"
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Current Order */}
        <div className="bg-secondary/30 rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase mb-3">Current Order</p>
          <div className="space-y-2">
            {currentOrder.map((slot) => (
              <div key={slot.callsign} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-secondary text-xs flex items-center justify-center">
                    {slot.position}
                  </span>
                  <span className="font-mono text-sm">{slot.callsign}</span>
                </div>
                <span className={`text-xs font-mono ${
                  slot.risk > 30 ? "text-destructive" : slot.risk > 15 ? "text-warning" : "text-success"
                }`}>
                  {slot.risk}%
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 flex justify-between">
            <span className="text-xs text-muted-foreground">Total Risk</span>
            <span className="text-sm font-mono text-warning">{currentTotalRisk}%</span>
          </div>
        </div>

        {/* Optimized Order */}
        <div className={`bg-secondary/30 rounded-lg p-4 transition-opacity duration-500 ${
          showOptimized ? "opacity-100" : "opacity-30"
        }`}>
          <p className="text-xs text-muted-foreground uppercase mb-3">
            {showOptimized ? "Optimized Order" : "Pending..."}
          </p>
          {showOptimized ? (
            <>
              <div className="space-y-2">
                {optimizedOrder.map((slot) => (
                  <div key={slot.callsign} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-primary/20 text-primary text-xs flex items-center justify-center">
                        {slot.position}
                      </span>
                      <span className="font-mono text-sm">{slot.callsign}</span>
                    </div>
                    <span className="text-xs font-mono text-success">{slot.risk}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 flex justify-between">
                <span className="text-xs text-muted-foreground">Total Risk</span>
                <span className="text-sm font-mono text-success">{optimizedTotalRisk}%</span>
              </div>
            </>
          ) : (
            <div className="h-32 flex items-center justify-center">
              {isOptimizing ? (
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="text-muted-foreground text-sm">Run analysis to see results</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Improvement indicator */}
      {showOptimized && (
        <div className="mt-4 p-3 bg-success/10 border border-success/30 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-success" />
            <span className="text-sm text-success">Safer ordering detected</span>
          </div>
          <span className="text-lg font-bold text-success">-{improvement}% risk</span>
        </div>
      )}
    </div>
  );
}
