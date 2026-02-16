import { Flight } from "@/types/flight";

/**
 * Calculate if a flight is within the 5-minute rolling window for slot review
 */
export function isWithinSlotWindow(flight: Flight, windowMinutes: number = 5): boolean {
    const now = new Date();
    const scheduledTime = parseTimeString(flight.actualTime || flight.scheduledTime);

    if (!scheduledTime) return false;

    const diffMinutes = (scheduledTime.getTime() - now.getTime()) / (1000 * 60);

    // Within window if scheduled time is between now and windowMinutes from now
    return diffMinutes >= 0 && diffMinutes <= windowMinutes;
}

/**
 * Parse time string (HH:MM format) into a Date object for today
 */
function parseTimeString(timeStr: string): Date | null {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;

    const now = new Date();
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    const scheduledDate = new Date(now);
    scheduledDate.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, assume it's for tomorrow
    if (scheduledDate < now) {
        scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    return scheduledDate;
}

/**
 * Get flights that are ready for slot review (within the rolling window)
 */
export function getFlightsInSlotWindow(flights: Flight[], windowMinutes: number = 5): Flight[] {
    return flights.filter(flight => isWithinSlotWindow(flight, windowMinutes));
}

/**
 * Calculate priority score for emergency flights
 */
export function calculateEmergencyPriority(flight: Flight): number {
    let priority = 0;

    if (flight.isEmergency) {
        priority += 1000; // Emergency gets highest priority
    }

    if (flight.fuel < 30) {
        priority += 500; // Critical fuel
    } else if (flight.fuel < 50) {
        priority += 200; // Low fuel
    }

    if (flight.riskLevel === "unsafe") {
        priority += 300;
    } else if (flight.riskLevel === "borderline") {
        priority += 100;
    }

    return priority;
}

/**
 * Sort flights by priority (emergency, fuel, risk)
 */
export function sortFlightsByPriority(flights: Flight[]): Flight[] {
    return [...flights].sort((a, b) => {
        const priorityA = calculateEmergencyPriority(a);
        const priorityB = calculateEmergencyPriority(b);
        return priorityB - priorityA; // Higher priority first
    });
}
