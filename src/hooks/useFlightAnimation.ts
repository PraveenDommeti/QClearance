import { FlightAnimation } from "@/components/MapView";
import { Flight } from "@/types/flight";
import { useCallback, useEffect, useRef, useState } from "react";

const PHASE_DURATION = 4000; // 4 seconds per phase
const UPDATE_INTERVAL = 200; // Update every 200ms (20 updates per phase)

export function useFlightAnimation() {
  const [animatingFlights, setAnimatingFlights] = useState<Map<string, FlightAnimation>>(new Map());
  const [completedFlights, setCompletedFlights] = useState<Set<string>>(new Set());

  // Store intervals for each flight
  const intervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Clear interval for a specific flight
  const clearFlightInterval = useCallback((flightId: string) => {
    const interval = intervalsRef.current.get(flightId);
    if (interval) {
      clearInterval(interval);
      intervalsRef.current.delete(flightId);
      console.log(`[INTERVAL CLEARED] ${flightId}`);
    }
  }, []);

  const startTakeoffAnimation = useCallback((flight: Flight) => {
    console.log(`[ANIMATION START] ${flight.callsign} - TAKEOFF`);

    // Clear any existing animation
    clearFlightInterval(flight.id);

    const phases: FlightAnimation["phase"][] = ["taxi-out", "runway", "takeoff"];
    let currentPhaseIndex = 0;
    let progress = 0;

    // Set initial state
    setAnimatingFlights(prev => {
      const next = new Map(prev);
      next.set(flight.id, {
        flightId: flight.id,
        type: "takeoff",
        phase: phases[0],
        progress: 0,
      });
      return next;
    });

    // Create interval
    const interval = setInterval(() => {
      progress += 5;

      // Phase complete?
      if (progress >= 100) {
        currentPhaseIndex++;
        progress = 0;

        // All phases complete?
        if (currentPhaseIndex >= phases.length) {
          console.log(`[ANIMATION COMPLETE] ${flight.callsign} - TAKEOFF`);

          setAnimatingFlights(prev => {
            const next = new Map(prev);
            next.set(flight.id, {
              flightId: flight.id,
              type: "takeoff",
              phase: "complete",
              progress: 100,
            });
            return next;
          });

          setCompletedFlights(prev => new Set(prev).add(flight.id));
          clearFlightInterval(flight.id);
          return;
        }
      }

      // Update current phase
      setAnimatingFlights(prev => {
        const next = new Map(prev);
        next.set(flight.id, {
          flightId: flight.id,
          type: "takeoff",
          phase: phases[currentPhaseIndex],
          progress,
        });
        return next;
      });
    }, UPDATE_INTERVAL);

    intervalsRef.current.set(flight.id, interval);
  }, [clearFlightInterval]);

  const startLandingAnimation = useCallback((flight: Flight) => {
    console.log(`[ANIMATION START] ${flight.callsign} - LANDING`);

    // Clear any existing animation
    clearFlightInterval(flight.id);

    const phases: FlightAnimation["phase"][] = ["runway", "taxi-in", "gate"];
    let currentPhaseIndex = 0;
    let progress = 0;

    // Set initial state
    setAnimatingFlights(prev => {
      const next = new Map(prev);
      next.set(flight.id, {
        flightId: flight.id,
        type: "landing",
        phase: phases[0],
        progress: 0,
      });
      return next;
    });

    // Create interval
    const interval = setInterval(() => {
      progress += 5;

      // Phase complete?
      if (progress >= 100) {
        currentPhaseIndex++;
        progress = 0;

        // All phases complete?
        if (currentPhaseIndex >= phases.length) {
          console.log(`[ANIMATION COMPLETE] ${flight.callsign} - LANDING`);

          setAnimatingFlights(prev => {
            const next = new Map(prev);
            next.set(flight.id, {
              flightId: flight.id,
              type: "landing",
              phase: "complete",
              progress: 100,
            });
            return next;
          });

          setCompletedFlights(prev => new Set(prev).add(flight.id));
          clearFlightInterval(flight.id);
          return;
        }
      }

      // Update current phase
      setAnimatingFlights(prev => {
        const next = new Map(prev);
        next.set(flight.id, {
          flightId: flight.id,
          type: "landing",
          phase: phases[currentPhaseIndex],
          progress,
        });
        return next;
      });
    }, UPDATE_INTERVAL);

    intervalsRef.current.set(flight.id, interval);
  }, [clearFlightInterval]);

  const approveFlightClearance = useCallback((flight: Flight) => {
    // Guard: Don't approve if already animating or completed
    if (animatingFlights.has(flight.id)) {
      console.log(`[CLEARANCE] SKIPPED - ${flight.callsign} already animating`);
      return;
    }

    if (completedFlights.has(flight.id)) {
      console.log(`[CLEARANCE] SKIPPED - ${flight.callsign} already completed`);
      return;
    }

    console.log(`[CLEARANCE] Approving ${flight.callsign} for ${flight.type}`);

    if (flight.type === "departure") {
      startTakeoffAnimation(flight);
    } else {
      startLandingAnimation(flight);
    }
  }, [startTakeoffAnimation, startLandingAnimation, animatingFlights, completedFlights]);

  const isFlightComplete = useCallback((flightId: string) => {
    return completedFlights.has(flightId);
  }, [completedFlights]);

  const getAnimationPhase = useCallback((flightId: string) => {
    return animatingFlights.get(flightId);
  }, [animatingFlights]);

  const isRunwayInUse = useCallback(() => {
    for (const [flightId, animation] of animatingFlights.entries()) {
      // Skip completed animations
      if (animation.phase === "complete") continue;

      // Block if any flight is on runway or taking off
      if (animation.phase === "runway" || animation.phase === "takeoff") {
        console.log(`[RUNWAY CHECK] In use by ${flightId} (phase: ${animation.phase}, progress: ${animation.progress}%)`);
        return true;
      }
    }
    return false;
  }, [animatingFlights]);

  const getActiveRunwayFlight = useCallback(() => {
    for (const [flightId, animation] of animatingFlights.entries()) {
      if (animation.phase === "runway" || animation.phase === "takeoff") {
        return flightId;
      }
    }
    return null;
  }, [animatingFlights]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      intervalsRef.current.forEach((interval) => {
        clearInterval(interval);
      });
      intervalsRef.current.clear();
    };
  }, []);

  return {
    animatingFlights,
    completedFlights,
    approveFlightClearance,
    isFlightComplete,
    getAnimationPhase,
    isRunwayInUse,
    getActiveRunwayFlight,
  };
}
