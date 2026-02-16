import DemoControls from "@/components/DemoControls";
import EnhancedRunwayView from "@/components/EnhancedRunwayView";
import MapView, { FlightAnimation } from "@/components/MapView";
import MonitoringControls from "@/components/MonitoringControls";
import RadarView from "@/components/RadarView";
import { useFlightData } from "@/contexts/FlightDataContext";
import { useFlightAnimation } from "@/hooks/useFlightAnimation";
import { isWithinSlotWindow } from "@/lib/slotWindow";
import { playSoundEffect } from "@/lib/soundEffects";
import { Flight } from "@/types/flight";
import { AlertTriangle, ArrowDown, ArrowUp, Check, Clock, MapIcon, Plane, Radar, Shield } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface LiveQueueTabProps {
  onSelectFlight: (flight: Flight) => void;
  selectedFlight?: Flight;
  triggeredFlightId?: string | null;
  onTriggerProcessed?: () => void;
}

export default function LiveQueueTab({ onSelectFlight, selectedFlight, triggeredFlightId, onTriggerProcessed }: LiveQueueTabProps) {
  const [filter, setFilter] = useState<"all" | "departure" | "arrival">("all");
  const [viewMode, setViewMode] = useState<"radar" | "map">("map");
  const { animatingFlights, completedFlights, approveFlightClearance, getAnimationPhase, isRunwayInUse, getActiveRunwayFlight } = useFlightAnimation();
  const { flights, createClearance, getClearance, clearances, updateFlight, addFlight } = useFlightData();

  // Track processed triggers to prevent duplicates
  const processedTriggersRef = useRef<Set<string>>(new Set());
  const emergencyFlightsRef = useRef<Set<string>>(new Set());

  const filteredFlights = flights.filter(
    (f) => filter === "all" || f.type === filter
  ).filter(f => !completedFlights.has(f.id));

  // Detect new emergency flights and play alert
  useEffect(() => {
    flights.forEach(flight => {
      if (flight.isEmergency && !emergencyFlightsRef.current.has(flight.id)) {
        emergencyFlightsRef.current.add(flight.id);
        playSoundEffect.announceEmergency(flight.callsign);
        toast.error(`🚨 EMERGENCY: ${flight.callsign}`, {
          description: `Emergency flight requires immediate attention!`,
          duration: 8000,
        });
      } else if (!flight.isEmergency && emergencyFlightsRef.current.has(flight.id)) {
        emergencyFlightsRef.current.delete(flight.id);
      }
    });
  }, [flights]);


  // Auto-trigger animation when flight is approved from decision phase
  useEffect(() => {
    if (triggeredFlightId) {
      // Check if we've already processed this trigger
      if (processedTriggersRef.current.has(triggeredFlightId)) {
        console.log(`[TRIGGER] Already processed ${triggeredFlightId}, skipping`);
        return;
      }

      const flight = flights.find(f => f.id === triggeredFlightId);
      if (flight) {
        // Check runway conflict even for auto-triggered flights
        const activeFlightId = getActiveRunwayFlight();
        if (activeFlightId) {
          const blockingFlight = flights.find(f => f.id === activeFlightId);
          playSoundEffect.emergencyAlert(); // Audio alert for conflict
          toast.error("🚨 RUNWAY CONFLICT DETECTED!", {
            description: `Cannot clear ${flight.callsign} - runway is in use by ${blockingFlight?.callsign || activeFlightId}. Please wait.`,
            duration: 6000,
          });
          // Clear trigger so it can be retried later
          if (onTriggerProcessed) {
            onTriggerProcessed();
          }
          return;
        }

        // Mark as processed BEFORE approving to prevent re-entry
        processedTriggersRef.current.add(triggeredFlightId);
        console.log(`[TRIGGER] Processing ${flight.callsign} (${triggeredFlightId})`);

        // Safe to proceed
        approveFlightClearance(flight);
        playSoundEffect.announceClearance(flight.callsign, flight.type === 'departure' ? 'takeoff' : 'landing');
        toast.success(`✓ Auto-Clearance Approved`, {
          description: `${flight.callsign} cleared for ${flight.type} from decision review.`,
          duration: 3000,
        });

        // Clear trigger after successful processing
        if (onTriggerProcessed) {
          setTimeout(() => onTriggerProcessed(), 500);
        }
      }
    }
  }, [triggeredFlightId, flights]);

  const getStatusColor = (status: Flight["status"]) => {
    switch (status) {
      case "active": return "text-success";
      case "cleared": return "text-primary";
      case "taxiing": return "text-warning";
      case "holding": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getRiskBadge = (risk: Flight["riskLevel"]) => {
    switch (risk) {
      case "safe": return <span className="status-safe px-2 py-0.5 rounded text-xs border">SAFE</span>;
      case "borderline": return <span className="status-warning px-2 py-0.5 rounded text-xs border">REVIEW</span>;
      case "unsafe": return <span className="status-danger px-2 py-0.5 rounded text-xs border">ALERT</span>;
    }
  };

  const getAnimationStatus = (flightId: string) => {
    const animation = getAnimationPhase(flightId);
    if (!animation) return null;

    const phaseLabels: Record<FlightAnimation["phase"], string> = {
      "taxi-out": "Taxiing to Runway",
      "runway": "On Runway",
      "takeoff": "Taking Off",
      "taxi-in": "Taxiing to Gate",
      "gate": "Approaching Gate",
      "complete": "Complete",
    };

    return (
      <div className="flex items-center gap-2 mt-2">
        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-200 rounded-full"
            style={{ width: `${animation.progress}%` }}
          />
        </div>
        <span className="text-xs text-primary font-medium animate-pulse">
          {phaseLabels[animation.phase]}
        </span>
      </div>
    );
  };

  const handleApprove = (flight: Flight, e: React.MouseEvent) => {
    e.stopPropagation();

    // Check if runway is in use BEFORE starting animation
    const activeFlightId = getActiveRunwayFlight();
    if (activeFlightId) {
      const blockingFlight = flights.find(f => f.id === activeFlightId);
      playSoundEffect.emergencyAlert(); // Audio alert for conflict
      toast.error("🚨 RUNWAY CONFLICT DETECTED!", {
        description: `Runway is in use by ${blockingFlight?.callsign || activeFlightId}. Wait for it to clear before approving ${flight.callsign}.`,
        duration: 6000,
      });
      console.warn(`[RUNWAY CONFLICT] Blocked ${flight.callsign} - runway in use by ${blockingFlight?.callsign}`);
      return;
    }

    console.log(`[CLEARANCE APPROVED] ${flight.callsign} - ${flight.type}`);

    // Create clearance first (Phase 2)
    createClearance(flight);
    // Then start animation
    approveFlightClearance(flight);
    // Play clearance sound
    playSoundEffect.announceClearance(flight.callsign, flight.type === 'departure' ? 'takeoff' : 'landing');
    toast.success(`✓ Clearance Approved`, {
      description: `${flight.callsign} cleared for ${flight.type}.`,
      duration: 3000,
    });
  };

  const activeFlights = flights.filter(f => !completedFlights.has(f.id));

  return (
    <div className="space-y-6">
      {/* Demo Controls */}
      <DemoControls
        flights={flights}
        onUpdateFlight={updateFlight}
        onAddFlight={addFlight}
      />

      {/* Monitoring Controls */}
      <MonitoringControls />

      <div className="grid grid-cols-12 gap-6">
        {/* Radar/Map Section */}
        <div className="col-span-12 lg:col-span-5">
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setViewMode("radar")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === "radar"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                }`}
            >
              <Radar className="w-4 h-4" />
              Radar View
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === "map"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                }`}
            >
              <MapIcon className="w-4 h-4" />
              Map View
            </button>
          </div>

          {viewMode === "radar" ? (
            <RadarView flights={activeFlights} onSelectFlight={onSelectFlight} />
          ) : (
            <MapView
              flights={activeFlights}
              onSelectFlight={onSelectFlight}
              animatingFlights={animatingFlights}
            />
          )}
        </div>

        {/* Enhanced Runway */}
        <div className="col-span-12 lg:col-span-1">
          <EnhancedRunwayView flights={activeFlights} animatingFlights={animatingFlights} />
        </div>

        {/* Queue List */}
        <div className="col-span-12 lg:col-span-6">
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Live Runway Queue</h3>
                <p className="text-xs text-muted-foreground">Click Approve to clear flights for takeoff/landing</p>
              </div>
              <div className="flex gap-2">
                {["all", "departure", "arrival"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as typeof filter)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${filter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {f === "all" ? "All" : f === "departure" ? <><ArrowUp className="w-3 h-3 inline mr-1" />DEP</> : <><ArrowDown className="w-3 h-3 inline mr-1" />ARR</>}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredFlights.map((flight) => {
                const isAnimating = animatingFlights.has(flight.id);

                return (
                  <div
                    key={flight.id}
                    onClick={() => onSelectFlight(flight)}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${selectedFlight?.id === flight.id
                      ? "bg-primary/10 border-primary/50"
                      : isAnimating
                        ? "bg-primary/5 border-primary/30"
                        : "bg-secondary/30 border-transparent hover:border-primary/30"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${flight.type === "departure" ? "bg-primary/20" : "bg-arrival/20"
                          }`}>
                          <Plane className={`w-4 h-4 ${flight.type === "departure" ? "text-primary rotate-45" : "text-arrival -rotate-45"
                            }`} />
                        </div>
                        <div>
                          <p className="font-mono font-bold text-foreground">{flight.callsign}</p>
                          <p className="text-xs text-muted-foreground">{flight.aircraft} • {flight.airline}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Emergency Badge */}
                        {flight.isEmergency && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-destructive/20 text-destructive text-xs font-bold rounded border border-destructive/50 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            EMERGENCY
                          </span>
                        )}

                        {/* 5-Minute Window Badge */}
                        {isWithinSlotWindow(flight) && !flight.isEmergency && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-warning/20 text-warning text-xs font-medium rounded border border-warning/30">
                            <Clock className="w-3 h-3" />
                            READY
                          </span>
                        )}

                        {getRiskBadge(flight.riskLevel)}
                        {(() => {
                          const clearance = getClearance(flight.id);
                          if (clearance) {
                            return (
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg">
                                <Shield className="w-3 h-3 text-primary" />
                                <span className="text-xs font-medium text-primary">
                                  {clearance.status === "under-monitoring" ? "MONITORING" : clearance.status.toUpperCase()}
                                </span>
                              </div>
                            );
                          }
                          if (!isAnimating) {
                            return (
                              <button
                                onClick={(e) => handleApprove(flight, e)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-success/20 hover:bg-success/30 text-success text-xs font-medium rounded-lg transition-all border border-success/30"
                              >
                                <Check className="w-3 h-3" />
                                Approve
                              </button>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-xs">
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className={`font-medium capitalize ${getStatusColor(flight.status)}`}>
                          {flight.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Runway</p>
                        <p className="font-mono text-foreground">{flight.runway}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Time</p>
                        <p className="font-mono text-foreground">{flight.actualTime || flight.scheduledTime}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fuel</p>
                        <p className={`font-mono ${flight.fuel < 30 ? "text-destructive" : flight.fuel < 50 ? "text-warning" : "text-foreground"}`}>
                          {flight.fuel}%
                        </p>
                      </div>
                    </div>

                    {/* Animation progress */}
                    {getAnimationStatus(flight.id)}
                  </div>
                );
              })}

              {filteredFlights.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Plane className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>All flights have been cleared</p>
                </div>
              )}
            </div>

            {/* Queue Stats */}
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{activeFlights.filter(f => f.type === "departure").length}</p>
                <p className="text-xs text-muted-foreground">Departures</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{activeFlights.filter(f => f.type === "arrival").length}</p>
                <p className="text-xs text-muted-foreground">Arrivals</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">{clearances.filter(c => c.riskLevel !== "safe" && c.status !== "completed").length}</p>
                <p className="text-xs text-muted-foreground">Monitored</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{completedFlights.size}</p>
                <p className="text-xs text-muted-foreground">Cleared</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
