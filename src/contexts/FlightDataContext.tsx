import { mockAuditLogs, mockDecisions, mockFlights } from "@/data/mockData";
import { Clearance, ClearanceConditions } from "@/types/clearance";
import { AgentResult, AuditLog, Decision, Flight } from "@/types/flight";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface FlightDataContextType {
  // Flight Data
  flights: Flight[];
  addFlight: (flight: Omit<Flight, "id"> & { id?: string }) => void;
  updateFlight: (id: string, updates: Partial<Flight>) => void;

  // Clearances (Phase 2)
  clearances: Clearance[];
  createClearance: (flight: Flight, agentResults?: AgentResult[]) => Clearance;
  getClearance: (flightId: string) => Clearance | undefined;
  updateClearanceRisk: (clearanceId: string, riskLevel: "safe" | "borderline" | "unsafe", riskScore: number) => void;

  // Decisions (Phase 6)
  decisions: Decision[];
  addDecision: (decision: Decision) => void;
  updateDecision: (id: string, updates: Partial<Decision>) => void;

  // Audit Logs (Phase 8)
  auditLogs: AuditLog[];
  addAuditLog: (log: Omit<AuditLog, "id" | "timestamp">) => void;

  // Monitoring Controls (Phase 4)
  monitoringEnabled: boolean;
  setMonitoringEnabled: (enabled: boolean) => void;
  injectDelay: (flightId: string, delayMinutes: number) => void;
  injectCongestion: (level: "low" | "moderate" | "high") => void;
  injectWeatherChange: (condition: string) => void;
  congestionLevel: string;
  weatherCondition: string;

  // Conflict Detection (Phase 7)
  detectConflicts: () => void;
  conflicts: Array<{ id: string; description: string; severity: "warning" | "critical"; flightIds: string[] }>;

  // Live Updates (Phase 1)
  lastUpdate: Date;
  liveDataEnabled: boolean;
  setLiveDataEnabled: (enabled: boolean) => void;
}

const FlightDataContext = createContext<FlightDataContextType | undefined>(undefined);

export function FlightDataProvider({ children }: { children: React.ReactNode }) {
  // State
  const [flights, setFlights] = useState<Flight[]>(mockFlights);
  const [clearances, setClearances] = useState<Clearance[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>(mockDecisions);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [liveDataEnabled, setLiveDataEnabled] = useState(true);
  const [congestionLevel, setCongestionLevel] = useState("moderate");
  const [weatherCondition, setWeatherCondition] = useState("VFR");
  const [conflicts, setConflicts] = useState<Array<{ id: string; description: string; severity: "warning" | "critical"; flightIds: string[] }>>([]);
  const [nextFlightId, setNextFlightId] = useState(10);

  // Add audit log helper
  const addAuditLog = useCallback((log: Omit<AuditLog, "id" | "timestamp">) => {
    const newLog: AuditLog = {
      ...log,
      id: `A${String(auditLogs.length + 1).padStart(3, "0")}`,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, [auditLogs.length]);

  // Phase 1: Live Flight Data Updates
  useEffect(() => {
    if (!liveDataEnabled) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());

      // Update fuel levels (decrease over time)
      setFlights(prev => prev.map(flight => {
        if (flight.status === "active" || flight.status === "taxiing") {
          const newFuel = Math.max(10, flight.fuel - Math.random() * 2);
          return { ...flight, fuel: Math.round(newFuel) };
        }
        return flight;
      }));

      // Randomly add new arrivals (10% chance every 5 seconds)
      if (Math.random() < 0.1 && flights.length < 10) {
        const airlines = ["Emirates", "Etihad", "Qatar", "Fly Dubai", "Air Arabia"];
        const aircrafts = ["A333", "A364", "B738", "A345", "B789"];
        const routes = ["MCT → DXB", "DOH → DXB", "AUH → DXB", "JED → DXB"];

        const newFlight: Flight = {
          id: String(nextFlightId),
          callsign: `FLT${Math.floor(Math.random() * 9000) + 1000}`,
          aircraft: aircrafts[Math.floor(Math.random() * aircrafts.length)],
          type: Math.random() > 0.5 ? "arrival" : "departure",
          status: "queued",
          runway: "08L",
          taxiway: `A${Math.floor(Math.random() * 5) + 1}`,
          gate: ["A08", "B22", "D12", "C15", "A12"][Math.floor(Math.random() * 5)],
          scheduledTime: new Date(Date.now() + Math.random() * 30 * 60000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
          fuel: 60 + Math.floor(Math.random() * 30),
          speed: 0,
          position: { x: 30, y: 25 },
          heading: 90,
          airline: airlines[Math.floor(Math.random() * airlines.length)],
          route: routes[Math.floor(Math.random() * routes.length)],
          riskLevel: "safe",
        };

        setFlights(prev => [...prev, newFlight]);
        setNextFlightId(prev => prev + 1);

        addAuditLog({
          type: "system",
          severity: "info",
          message: `New ${newFlight.type} ${newFlight.callsign} entered queue`,
          actor: "System",
          details: `${newFlight.aircraft} from ${newFlight.route}`,
        });
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [liveDataEnabled, flights.length, nextFlightId, addAuditLog]);

  // Phase 2: Create Clearance
  const createClearance = useCallback((flight: Flight, agentResults?: AgentResult[]): Clearance => {
    const conditions: ClearanceConditions = {
      fuel: flight.fuel,
      weather: weatherCondition,
      congestion: congestionLevel,
      visibility: 10,
      wind: "12kts from 090°",
      timestamp: new Date().toISOString(),
    };

    // Calculate risk score based on conditions and agent results
    let riskScore = 0;
    let riskLevel: "safe" | "borderline" | "unsafe" = "safe";

    if (agentResults) {
      const unsafeCount = agentResults.filter(a => a.result === "unsafe").length;
      const borderlineCount = agentResults.filter(a => a.result === "borderline").length;

      riskScore = (unsafeCount * 30) + (borderlineCount * 15);

      if (unsafeCount > 0) riskLevel = "unsafe";
      else if (borderlineCount > 0) riskLevel = "borderline";
      else riskLevel = "safe";
    }

    const clearance: Clearance = {
      id: `CLR-${Date.now()}-${flight.id}`,
      flightId: flight.id,
      callsign: flight.callsign,
      type: flight.type === "departure" ? "takeoff" : "landing",
      status: "under-monitoring",
      issuedAt: new Date().toLocaleTimeString("en-US", { hour12: false }),
      conditions,
      agentAnalysis: agentResults,
      riskLevel,
      riskScore,
      lastEvaluated: new Date().toLocaleTimeString("en-US", { hour12: false }),
      evaluationCount: 1,
    };

    setClearances(prev => [...prev, clearance]);

    addAuditLog({
      type: "clearance",
      severity: riskLevel === "unsafe" ? "warning" : "info",
      message: `Clearance ${clearance.type} issued for ${flight.callsign}`,
      actor: "Controller",
      details: `Risk: ${riskLevel.toUpperCase()}, Score: ${riskScore}%`,
    });

    return clearance;
  }, [weatherCondition, congestionLevel, addAuditLog]);

  // Phase 4: Continuous Monitoring - Re-evaluate clearances
  useEffect(() => {
    if (!monitoringEnabled || clearances.length === 0) return;

    const interval = setInterval(() => {
      clearances.forEach(clearance => {
        if (clearance.status === "completed") return;

        // Get current flight data
        const flight = flights.find(f => f.id === clearance.flightId);
        if (!flight) return;

        // Re-calculate risk based on current conditions
        let newRiskScore = clearance.riskScore;
        let newRiskLevel = clearance.riskLevel;

        // Fuel check
        if (flight.fuel < 30) {
          newRiskScore += 20;
          newRiskLevel = "unsafe";
        } else if (flight.fuel < 50) {
          newRiskScore += 10;
          if (newRiskLevel === "safe") newRiskLevel = "borderline";
        }

        // Congestion check
        if (congestionLevel === "high") {
          newRiskScore += 15;
          if (newRiskLevel === "safe") newRiskLevel = "borderline";
        }

        // Weather check
        if (weatherCondition === "IFR" || weatherCondition === "LIFR") {
          newRiskScore += 20;
          newRiskLevel = "unsafe";
        }

        // Update if risk changed
        if (newRiskScore !== clearance.riskScore || newRiskLevel !== clearance.riskLevel) {
          updateClearanceRisk(clearance.id, newRiskLevel, newRiskScore);

          addAuditLog({
            type: "agent",
            severity: newRiskLevel === "unsafe" ? "critical" : "warning",
            message: `Risk level changed for ${clearance.callsign}: ${clearance.riskLevel} → ${newRiskLevel}`,
            actor: "Monitoring System",
            details: `Risk score: ${clearance.riskScore}% → ${newRiskScore}%. Fuel: ${flight.fuel}%, Congestion: ${congestionLevel}`,
          });

          // Generate decision if risk increased
          if (newRiskLevel === "unsafe" && clearance.riskLevel !== "unsafe") {
            const decision: Decision = {
              id: `DEC${String(decisions.length + 1).padStart(3, "0")}`,
              flightId: flight.id,
              callsign: flight.callsign,
              type: "alert",
              recommendation: `Risk elevated to UNSAFE for ${flight.callsign}. Recommend immediate action: ${flight.fuel < 30 ? "Priority landing due to fuel" : "Hold or delay"}`,
              status: "escalated",
              agentAnalysis: clearance.agentAnalysis || [],
              timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
            };
            addDecision(decision);
          }
        }
      });
    }, 8000); // Check every 8 seconds

    return () => clearInterval(interval);
  }, [monitoringEnabled, clearances, flights, congestionLevel, weatherCondition, decisions.length, addAuditLog]);

  // Helper functions
  const updateFlight = useCallback((id: string, updates: Partial<Flight>) => {
    setFlights(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  const addFlight = useCallback((flight: Omit<Flight, "id"> & { id?: string }) => {
    const newFlight: Flight = {
      ...flight,
      id: flight.id || String(nextFlightId),
    };
    setFlights(prev => [...prev, newFlight]);
    setNextFlightId(prev => prev + 1);

    addAuditLog({
      type: "system",
      severity: "info",
      message: `Flight ${newFlight.callsign} added to queue`,
      actor: "Demo Controls",
      details: `${newFlight.aircraft} ${newFlight.type}${newFlight.isEmergency ? " - EMERGENCY" : ""}`,
    });
  }, [nextFlightId, addAuditLog]);

  const getClearance = useCallback((flightId: string) => {
    return clearances.find(c => c.flightId === flightId && c.status !== "completed");
  }, [clearances]);

  const updateClearanceRisk = useCallback((clearanceId: string, riskLevel: "safe" | "borderline" | "unsafe", riskScore: number) => {
    setClearances(prev => prev.map(c =>
      c.id === clearanceId
        ? {
          ...c,
          riskLevel,
          riskScore,
          lastEvaluated: new Date().toLocaleTimeString("en-US", { hour12: false }),
          evaluationCount: c.evaluationCount + 1,
          status: riskLevel === "unsafe" ? "critical" : riskLevel === "borderline" ? "warning" : "safe"
        }
        : c
    ));
  }, []);

  const addDecision = useCallback((decision: Decision) => {
    setDecisions(prev => [decision, ...prev]);
  }, []);

  const updateDecision = useCallback((id: string, updates: Partial<Decision>) => {
    setDecisions(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  // Phase 4: Monitoring Controls
  const injectDelay = useCallback((flightId: string, delayMinutes: number) => {
    const flight = flights.find(f => f.id === flightId);
    if (!flight) return;

    addAuditLog({
      type: "system",
      severity: "warning",
      message: `Delay injected: ${flight.callsign} delayed by ${delayMinutes} minutes`,
      actor: "Simulation",
      details: `Testing continuous monitoring response`,
    });

    // Force re-evaluation by updating flight
    updateFlight(flightId, {
      actualTime: new Date(Date.now() + delayMinutes * 60000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
    });
  }, [flights, addAuditLog, updateFlight]);

  const injectCongestion = useCallback((level: "low" | "moderate" | "high") => {
    setCongestionLevel(level);
    addAuditLog({
      type: "system",
      severity: level === "high" ? "warning" : "info",
      message: `Congestion level changed to ${level.toUpperCase()}`,
      actor: "Simulation",
      details: `Testing continuous monitoring with congestion changes`,
    });
  }, [addAuditLog]);

  const injectWeatherChange = useCallback((condition: string) => {
    setWeatherCondition(condition);
    addAuditLog({
      type: "system",
      severity: condition === "IFR" || condition === "LIFR" ? "warning" : "info",
      message: `Weather condition changed to ${condition}`,
      actor: "Simulation",
      details: `Testing continuous monitoring with weather changes`,
    });
  }, [addAuditLog]);

  // Phase 7: Conflict Detection
  const detectConflicts = useCallback(() => {
    const newConflicts: typeof conflicts = [];

    // Check for timing conflicts (flights too close on same runway)
    flights.forEach((f1, i) => {
      flights.slice(i + 1).forEach(f2 => {
        if (f1.runway === f2.runway && f1.status !== "queued" && f2.status !== "queued") {
          // Parse times and check if within 2 minutes
          const time1 = f1.actualTime || f1.scheduledTime;
          const time2 = f2.actualTime || f2.scheduledTime;

          newConflicts.push({
            id: `CONF-${f1.id}-${f2.id}`,
            description: `Potential runway conflict: ${f1.callsign} and ${f2.callsign} on ${f1.runway}`,
            severity: "warning",
            flightIds: [f1.id, f2.id],
          });
        }
      });
    });

    // Check for fuel-critical arrivals
    flights.forEach(f => {
      if (f.type === "arrival" && f.fuel < 25) {
        newConflicts.push({
          id: `FUEL-${f.id}`,
          description: `CRITICAL: ${f.callsign} fuel at ${f.fuel}% - priority landing required`,
          severity: "critical",
          flightIds: [f.id],
        });
      }
    });

    setConflicts(newConflicts);

    if (newConflicts.length > 0) {
      newConflicts.forEach(conflict => {
        addAuditLog({
          type: "alert",
          severity: conflict.severity === "critical" ? "critical" : "warning",
          message: conflict.description,
          actor: "Conflict Detection System",
          details: `Detected at ${new Date().toLocaleTimeString()}`,
        });
      });
    }
  }, [flights, addAuditLog]);

  // Run conflict detection periodically
  useEffect(() => {
    if (!monitoringEnabled) return;
    const interval = setInterval(detectConflicts, 10000);
    return () => clearInterval(interval);
  }, [monitoringEnabled, detectConflicts]);

  const value: FlightDataContextType = {
    flights,
    addFlight,
    updateFlight,
    clearances,
    createClearance,
    getClearance,
    updateClearanceRisk,
    decisions,
    addDecision,
    updateDecision,
    auditLogs,
    addAuditLog,
    monitoringEnabled,
    setMonitoringEnabled,
    injectDelay,
    injectCongestion,
    injectWeatherChange,
    congestionLevel,
    weatherCondition,
    detectConflicts,
    conflicts,
    lastUpdate,
    liveDataEnabled,
    setLiveDataEnabled,
  };

  return (
    <FlightDataContext.Provider value={value}>
      {children}
    </FlightDataContext.Provider>
  );
}

export function useFlightData() {
  const context = useContext(FlightDataContext);
  if (!context) {
    throw new Error("useFlightData must be used within FlightDataProvider");
  }
  return context;
}
