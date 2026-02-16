import { playSoundEffect } from '@/lib/soundEffects';
import { Flight, TabId } from '@/types/flight';
import { useEffect, useRef, useState } from 'react';

interface DriftEvent {
    type: 'fuel-critical' | 'fuel-low' | 'weather-change' | 'congestion-increase';
    flightId: string;
    callsign: string;
    timestamp: number;
    details: string;
}

interface MonitoringState {
    driftEvents: DriftEvent[];
    shouldTriggerAnalysis: boolean;
    warningMessage: string | null;
}

/**
 * Continuous Monitoring Hook
 * Watches for fuel drops, weather shifts, and congestion increases
 * Auto-triggers agent analysis when 2+ drift events accumulate
 */
export function useContinuousMonitoring(
    flights: Flight[],
    onSwitchTab?: (tab: TabId) => void
) {
    const [monitoringState, setMonitoringState] = useState<MonitoringState>({
        driftEvents: [],
        shouldTriggerAnalysis: false,
        warningMessage: null,
    });

    // Track previous flight states
    const previousFlightsRef = useRef<Map<string, Flight>>(new Map());
    const analysisTriggeredRef = useRef(false);

    useEffect(() => {
        const newDriftEvents: DriftEvent[] = [];

        flights.forEach(flight => {
            const previousFlight = previousFlightsRef.current.get(flight.id);

            if (!previousFlight) {
                // First time seeing this flight, just store it
                previousFlightsRef.current.set(flight.id, { ...flight });
                return;
            }

            // Check for fuel drops
            if (previousFlight.fuel > 30 && flight.fuel <= 30) {
                newDriftEvents.push({
                    type: 'fuel-low',
                    flightId: flight.id,
                    callsign: flight.callsign,
                    timestamp: Date.now(),
                    details: `Fuel dropped to ${flight.fuel}%`,
                });
                playSoundEffect.fuelWarning();
            }

            if (previousFlight.fuel > 20 && flight.fuel <= 20) {
                newDriftEvents.push({
                    type: 'fuel-critical',
                    flightId: flight.id,
                    callsign: flight.callsign,
                    timestamp: Date.now(),
                    details: `Fuel critical at ${flight.fuel}%`,
                });
                playSoundEffect.announceFuelCritical(flight.callsign, flight.fuel);
            }

            // Update stored flight state
            previousFlightsRef.current.set(flight.id, { ...flight });
        });

        // Add new drift events to state
        if (newDriftEvents.length > 0) {
            setMonitoringState(prev => {
                const allEvents = [...prev.driftEvents, ...newDriftEvents];

                // Keep only events from last 5 minutes
                const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
                const recentEvents = allEvents.filter(e => e.timestamp > fiveMinutesAgo);

                // Check if we should trigger analysis (2+ events)
                const shouldTrigger = recentEvents.length >= 2 && !analysisTriggeredRef.current;

                if (shouldTrigger) {
                    analysisTriggeredRef.current = true;

                    // Generate warning message
                    const eventSummary = recentEvents
                        .map(e => `${e.callsign}: ${e.details}`)
                        .join('; ');

                    const warningMessage = `⚠️ Multiple drift events detected: ${eventSummary}. Auto-triggering agent analysis.`;

                    // Switch to agent analysis tab after a brief delay
                    setTimeout(() => {
                        onSwitchTab?.('agents');
                        playSoundEffect.weatherAlert();
                    }, 1000);

                    return {
                        driftEvents: recentEvents,
                        shouldTriggerAnalysis: true,
                        warningMessage,
                    };
                }

                return {
                    ...prev,
                    driftEvents: recentEvents,
                };
            });
        }
    }, [flights, onSwitchTab]);

    // Reset analysis trigger when user manually switches tabs
    const resetAnalysisTrigger = () => {
        analysisTriggeredRef.current = false;
        setMonitoringState(prev => ({
            ...prev,
            shouldTriggerAnalysis: false,
            warningMessage: null,
        }));
    };

    // Clear all drift events
    const clearDriftEvents = () => {
        setMonitoringState({
            driftEvents: [],
            shouldTriggerAnalysis: false,
            warningMessage: null,
        });
        analysisTriggeredRef.current = false;
    };

    return {
        driftEvents: monitoringState.driftEvents,
        shouldTriggerAnalysis: monitoringState.shouldTriggerAnalysis,
        warningMessage: monitoringState.warningMessage,
        resetAnalysisTrigger,
        clearDriftEvents,
    };
}
