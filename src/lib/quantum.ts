import { QuantumIssue, QuantumResult, SlotOrder } from "@/types/flight";

// Fallback UUID generator for browsers that don't support crypto.randomUUID
function generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback: simple UUID v4 generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Quantum-inspired Simulated Annealing for Runway Slot Optimization
// This mimics the energy landscape minimization of quantum annealing (QAOA)

interface EnergyState {
    order: SlotOrder[];
    energy: number;
}

// Configuration for the annealing process
const INITIAL_TEMPERATURE = 1000;
const COOLING_RATE = 0.95;
const ITERATIONS = 100;

/**
 * Calculates the "energy" (risk/cost) of a specific slot configuration
 * Lower energy = Better configuration (safer, more efficient)
 */
function calculateEnergy(order: SlotOrder[]): number {
    let energy = 0;

    for (let i = 0; i < order.length; i++) {
        const slot = order[i];
        const positionPenalty = i * 2; // Linear penalty for later positions

        // 0. EMERGENCY PRIORITY (HIGHEST PENALTY - MUST BE FIRST)
        // Emergency flights MUST be in first position, massive penalty otherwise
        if (slot.priority === 1000) { // Emergency flag
            if (i > 0) {
                energy += (i * 10000); // Extreme penalty for not being first
            }
        }

        // 1. Fuel Criticality (Heavy Penalty for delay)
        // If risk is high (interpreted here as fuel criticality for demo purposes)
        // We want them earlier.
        if (slot.risk > 30) {
            // Highly risky/low fuel should be early
            energy += (i * 50);
        } else if (slot.risk > 15) {
            energy += (i * 20);
        }

        // 2. Separation Constraints (simplified)
        // Avoid Arrival -> Arrival back-to-back if possible (simulated)
        if (i > 0) {
            const prev = order[i - 1];
            if (prev.type === slot.type) {
                // Same type back-to-back might increase turbulence risk or spacing needs
                energy += 10;
            }
        }
    }

    return energy;
}

/**
 * Generates a neighbor state by swapping two random flights
 */
function getNeighbor(order: SlotOrder[]): SlotOrder[] {
    const newOrder = [...order];
    const idx1 = Math.floor(Math.random() * newOrder.length);
    const idx2 = Math.floor(Math.random() * newOrder.length);

    // Swap
    [newOrder[idx1], newOrder[idx2]] = [newOrder[idx2], newOrder[idx1]];

    // Update positions
    return newOrder.map((slot, index) => ({
        ...slot,
        position: index + 1
    }));
}

/**
 * Runs the Quantum-Inspired Simulated Annealing algorithm
 */
export async function runQuantumOptimization(currentOrder: SlotOrder[]): Promise<QuantumResult> {
    // Safety check: Need at least 2 flights to optimize
    if (currentOrder.length < 2) {
        return {
            id: generateUUID(),
            timestamp: new Date().toISOString(),
            currentOrder: currentOrder,
            optimizedOrder: currentOrder,
            currentTotalRisk: 0,
            optimizedTotalRisk: 0,
            improvement: 0,
            permutationsEvaluated: 0,
            biasDetected: false,
            issues: [],
            status: "safe"
        };
    }

    let currentSolution = [...currentOrder];
    let currentEnergy = calculateEnergy(currentSolution);

    let bestSolution = [...currentSolution];
    let bestEnergy = currentEnergy;

    let temperature = INITIAL_TEMPERATURE;

    // Track issues for the report
    const issues: QuantumIssue[] = [];

    // Evolution loop
    for (let i = 0; i < ITERATIONS; i++) {
        const neighbor = getNeighbor(currentSolution);
        const neighborEnergy = calculateEnergy(neighbor);

        // Acceptance probability (Metropolis criterion)
        // If new energy is lower, accept.
        // If higher, accept with prob exp(-(delta)/T) to escape local minima (tunneling effect proxy)
        const delta = neighborEnergy - currentEnergy;

        if (delta < 0 || Math.random() < Math.exp(-delta / temperature)) {
            currentSolution = neighbor;
            currentEnergy = neighborEnergy;

            if (currentEnergy < bestEnergy) {
                bestSolution = [...currentSolution];
                bestEnergy = currentEnergy;
            }
        }

        temperature *= COOLING_RATE;

        // Non-blocking yield for UI responsiveness if this were heavy
        if (i % 20 === 0) await new Promise(r => setTimeout(r, 0));
    }

    // Analyze improvements and generate issues
    const improvement = ((calculateEnergy(currentOrder) - bestEnergy) / calculateEnergy(currentOrder)) * 100;

    // Detect specific issues fixed or remaining
    const fuelCritical = bestSolution.some((s, idx) => s.risk > 30 && idx > 2); // Still late in queue
    if (fuelCritical) {
        issues.push({
            id: "issue-" + Date.now(),
            type: "fuel-critical",
            severity: "critical",
            description: "Some high-risk flights remain in later slots due to heavy congestion.",
            affectedFlights: bestSolution.filter((s, idx) => s.risk > 30 && idx > 2).map(s => s.callsign),
            recommendation: "Manual override or diversion recommended for fueled-critical aircraft."
        });
    }

    const improvedSeparation = bestSolution.some((s, i) => i > 0 && s.type !== bestSolution[i - 1].type);
    if (improvedSeparation && improvement > 0) {
        // This is a "good" issue (improvement note)
        issues.push({
            id: "separation-" + Date.now(),
            type: "separation",
            severity: "warning", // Not really a warning but using type
            description: "Optimization improved mix of Arrival/Departure to maximize runway throughput.",
            affectedFlights: [],
            recommendation: "Adopt optimized order."
        });
    }

    return {
        id: generateUUID(),
        timestamp: new Date().toISOString(),
        currentOrder: currentOrder,
        optimizedOrder: bestSolution,
        currentTotalRisk: calculateEnergy(currentOrder),
        optimizedTotalRisk: bestEnergy,
        improvement: Math.max(0, Math.round(improvement)),
        permutationsEvaluated: ITERATIONS,
        biasDetected: false, // Could implement fairness check here
        issues: issues,
        status: improvement > 5 ? "safe" : "unsafe" // Simplified status
    };
}
