import { Flight } from "@/types/flight";

export interface FlightAnimation {
    type: "landing" | "takeoff";
    phase: string;
    progress: number;
}

interface MapViewProps {
    flights: Flight[];
    animatingFlights?: Map<string, FlightAnimation>;
    completedFlights?: Set<string>;
    onSelectFlight?: (flight: Flight) => void;
}

export default function MapView({
    flights = [],
    animatingFlights = new Map(),
    completedFlights = new Set(),
    onSelectFlight
}: MapViewProps) {
    const width = 400;
    const height = 400;

    // Terminal Building (Left side)
    const terminal = {
        x: 20,
        y: 80,
        width: 60,
        height: 240,
    };

    // Gates on terminal
    const gates = [
        { id: "A01", x: 50, y: 100, label: "A01" },
        { id: "A02", x: 50, y: 140, label: "A02" },
        { id: "B02", x: 50, y: 180, label: "B02" },
        { id: "C01", x: 50, y: 220, label: "C01" },
        { id: "C02", x: 50, y: 260, label: "C02" },
        { id: "D01", x: 50, y: 300, label: "D01" },
    ];

    // Single Runway (TRYA - Runway A only)
    const runwayA = {
        name: "08L/26R",
        x: 180,
        y1: 40,
        y2: 360,
        width: 20,
    };

    // Taxiways - L-shaped layout
    const taxiways = [
        // TWY A - Vertical taxiway (main north-south taxiway)
        { x1: 170, y1: 80, x2: 170, y2: 320 },

        // Cross taxiways - Horizontal connections from terminal to TWY A
        { x1: 80, y1: 120, x2: 170, y2: 120 },  // Upper cross taxiway
        { x1: 80, y1: 200, x2: 170, y2: 200 },  // Middle cross taxiway (main)
        { x1: 80, y1: 280, x2: 170, y2: 280 },  // Lower cross taxiway

        // Runway access taxiway - Horizontal connection from TWY A to runway
        { x1: 170, y1: 200, x2: 180, y2: 200 },
    ];

    // Holding positions
    const holdingPositions = [
        { x: 170, y: 120, label: "A1" },
        { x: 170, y: 200, label: "A2" },
        { x: 170, y: 280, label: "A3" },
    ];

    const getGatePosition = (gateId: string) => {
        const gate = gates.find((g) => g.id === gateId);
        return gate || gates[0];
    };

    const getAnimatedPosition = (flight: Flight, animation: FlightAnimation) => {
        const gatePos = getGatePosition(flight.gate);
        const progress = animation.progress / 100;

        // Use runway A for all animations (single runway)
        const runway = runwayA;
        const taxiwayY = 200; // Middle taxiway (TWY A horizontal)
        const taxiwayX = 170; // Holding position at TWY A
        const runwayThreshold = runway.y2 - 40; // Runway entry point

        if (flight.type === "departure") {
            // TAKEOFF: Gate → Cross taxiway (horizontal) → TWY A (vertical) → Holding → Runway → Takeoff
            switch (animation.phase) {
                case "taxi-out": {
                    // L-shaped path: Gate → horizontal to TWY A → vertical to taxiway
                    // Split into two segments: 50% horizontal, 50% vertical
                    if (progress < 0.5) {
                        // First half: Move horizontally from gate to TWY A
                        const horizontalProgress = progress * 2; // 0 to 1
                        return {
                            x: gatePos.x + (taxiwayX - gatePos.x) * horizontalProgress,
                            y: gatePos.y, // Stay at gate Y level
                        };
                    } else {
                        // Second half: Move vertically along TWY A to cross taxiway
                        const verticalProgress = (progress - 0.5) * 2; // 0 to 1
                        return {
                            x: taxiwayX, // Stay at TWY A
                            y: gatePos.y + (taxiwayY - gatePos.y) * verticalProgress,
                        };
                    }
                }
                case "runway": {
                    // Move from taxiway holding position to runway threshold
                    // First move horizontally to runway, then position for takeoff
                    if (progress < 0.7) {
                        // Move horizontally from holding to runway
                        const horizontalProgress = progress / 0.7;
                        return {
                            x: taxiwayX + (runway.x - taxiwayX) * horizontalProgress,
                            y: taxiwayY,
                        };
                    } else {
                        // Move to runway threshold (bottom)
                        const verticalProgress = (progress - 0.7) / 0.3;
                        return {
                            x: runway.x,
                            y: taxiwayY + (runwayThreshold - taxiwayY) * verticalProgress,
                        };
                    }
                }
                case "takeoff":
                    // Accelerate down runway and lift off
                    return {
                        x: runway.x,
                        y: runwayThreshold - (progress * (runway.y2 - runway.y1)),
                    };
                default:
                    return gatePos;
            }
        } else {
            // LANDING: Runway (top) → TWY A (vertical) → Cross taxiway (horizontal) → Gate
            switch (animation.phase) {
                case "runway":
                    // Touch down at top, roll down to taxiway exit point
                    return {
                        x: runway.x,
                        y: runway.y1 + (progress * (taxiwayY - runway.y1)),
                    };
                case "taxi-in": {
                    // Exit runway horizontally to TWY A holding position
                    return {
                        x: runway.x - (runway.x - taxiwayX) * progress,
                        y: taxiwayY, // Stay on cross taxiway
                    };
                }
                case "gate": {
                    // L-shaped path: TWY A → vertical to gate level → horizontal to gate
                    // Split into two segments: 50% vertical, 50% horizontal
                    if (progress < 0.5) {
                        // First half: Move vertically along TWY A from cross taxiway to gate level
                        const verticalProgress = progress * 2; // 0 to 1
                        return {
                            x: taxiwayX, // Stay at TWY A
                            y: taxiwayY + (gatePos.y - taxiwayY) * verticalProgress,
                        };
                    } else {
                        // Second half: Move horizontally from TWY A to gate
                        const horizontalProgress = (progress - 0.5) * 2; // 0 to 1
                        return {
                            x: taxiwayX + (gatePos.x - taxiwayX) * horizontalProgress,
                            y: gatePos.y, // Stay at gate Y level
                        };
                    }
                }
                default:
                    return { x: runway.x, y: runway.y1 - 20 }; // Off-screen above runway
            }
        }
    };

    return (
        <div className="relative w-full h-full bg-[#1a1d29] rounded-lg border border-[#2a2d3a] overflow-hidden">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Background */}
                <rect width={width} height={height} fill="#1a1d29" />

                {/* Grid pattern */}
                <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path
                            d="M 20 0 L 0 0 0 20"
                            fill="none"
                            stroke="#2a2d3a"
                            strokeWidth="0.5"
                        />
                    </pattern>

                    {/* Gradient for terminal */}
                    <linearGradient id="terminalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#2a2d3a" />
                        <stop offset="100%" stopColor="#1f222e" />
                    </linearGradient>
                </defs>
                <rect width={width} height={height} fill="url(#grid)" opacity="0.3" />

                {/* Terminal Building */}
                <g>
                    <rect
                        x={terminal.x}
                        y={terminal.y}
                        width={terminal.width}
                        height={terminal.height}
                        fill="url(#terminalGrad)"
                        stroke="#3a3d4a"
                        strokeWidth="2"
                        rx="4"
                    />
                    <text
                        x={terminal.x + terminal.width / 2}
                        y={terminal.y - 10}
                        fill="#8b92a7"
                        fontSize="14"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="JetBrains Mono, monospace"
                    >
                        TERMINAL
                    </text>
                </g>

                {/* Gates */}
                {gates.map((gate) => (
                    <g key={gate.id}>
                        <rect
                            x={gate.x - 15}
                            y={gate.y - 10}
                            width="30"
                            height="20"
                            fill="#2a2d3a"
                            stroke="#fbbf24"
                            strokeWidth="1.5"
                            strokeDasharray="3,2"
                            rx="2"
                        />
                        <text
                            x={gate.x}
                            y={gate.y + 4}
                            fill="#fbbf24"
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                            fontFamily="JetBrains Mono, monospace"
                        >
                            {gate.label}
                        </text>
                    </g>
                ))}

                {/* Taxiways */}
                {taxiways.map((taxiway, idx) => (
                    <line
                        key={idx}
                        x1={taxiway.x1}
                        y1={taxiway.y1}
                        x2={taxiway.x2}
                        y2={taxiway.y2}
                        stroke="#4a4d5a"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                ))}

                {/* Taxiway centerlines */}
                {taxiways.map((taxiway, idx) => (
                    <line
                        key={`center-${idx}`}
                        x1={taxiway.x1}
                        y1={taxiway.y1}
                        x2={taxiway.x2}
                        y2={taxiway.y2}
                        stroke="#fbbf24"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                    />
                ))}

                {/* Holding Positions */}
                {holdingPositions.map((hold, idx) => (
                    <g key={idx}>
                        <rect
                            x={hold.x - 8}
                            y={hold.y - 8}
                            width="16"
                            height="16"
                            fill="none"
                            stroke="#fbbf24"
                            strokeWidth="2"
                            strokeDasharray="2,2"
                        />
                        <text
                            x={hold.x}
                            y={hold.y + 25}
                            fill="#fbbf24"
                            fontSize="8"
                            fontWeight="600"
                            textAnchor="middle"
                            fontFamily="JetBrains Mono, monospace"
                        >
                            {hold.label}
                        </text>
                    </g>
                ))}

                {/* Runway A (TRYA) */}
                <g>
                    <rect
                        x={runwayA.x - runwayA.width / 2}
                        y={runwayA.y1}
                        width={runwayA.width}
                        height={runwayA.y2 - runwayA.y1}
                        fill="#3a3d4a"
                        stroke="#5a5d6a"
                        strokeWidth="2"
                    />
                    {/* Runway centerline */}
                    <line
                        x1={runwayA.x}
                        y1={runwayA.y1}
                        x2={runwayA.x}
                        y2={runwayA.y2}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        strokeDasharray="10,8"
                    />
                    {/* Runway designation */}
                    <text
                        x={runwayA.x}
                        y={runwayA.y1 - 10}
                        fill="#ffffff"
                        fontSize="16"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="JetBrains Mono, monospace"
                    >
                        {runwayA.name}
                    </text>
                </g>



                {/* Runway end markers */}
                <g>
                    <text
                        x={runwayA.x}
                        y={runwayA.y1 - 25}
                        fill="#8b92a7"
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="JetBrains Mono, monospace"
                    >
                        08L
                    </text>
                    <text
                        x={runwayA.x}
                        y={runwayA.y2 + 20}
                        fill="#8b92a7"
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="JetBrains Mono, monospace"
                    >
                        26R
                    </text>
                </g>

                {/* Flights */}
                {flights.map((flight) => {
                    const animation = animatingFlights?.get(flight.id);
                    const isCompleted = completedFlights?.has(flight.id) || false;

                    if (isCompleted) return null;

                    let position;
                    if (animation) {
                        position = getAnimatedPosition(flight, animation);
                    } else {
                        // Static position at gate
                        position = getGatePosition(flight.gate);
                    }

                    const isEmergency = flight.isEmergency;
                    const color = isEmergency
                        ? "#ef4444"
                        : flight.type === "departure"
                            ? "#22c55e"
                            : "#3b82f6";

                    return (
                        <g
                            key={flight.id}
                            onClick={() => onSelectFlight?.(flight)}
                            style={{ cursor: onSelectFlight ? 'pointer' : 'default' }}
                        >
                            {/* Aircraft icon - plane shape */}
                            <g transform={`translate(${position.x}, ${position.y})`}>
                                {/* Fuselage */}
                                <ellipse
                                    cx="0"
                                    cy="0"
                                    rx="6"
                                    ry="3"
                                    fill={color}
                                    stroke="#000000"
                                    strokeWidth="0.5"
                                />
                                {/* Wings */}
                                <line
                                    x1="-8"
                                    y1="0"
                                    x2="8"
                                    y2="0"
                                    stroke={color}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </g>

                            {/* Emergency indicator */}
                            {isEmergency && (
                                <circle
                                    cx={position.x}
                                    cy={position.y}
                                    r="12"
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="2"
                                    strokeDasharray="3,3"
                                    opacity="0.8"
                                >
                                    <animate
                                        attributeName="r"
                                        values="12;16;12"
                                        dur="1.5s"
                                        repeatCount="indefinite"
                                    />
                                    <animate
                                        attributeName="opacity"
                                        values="0.8;0.3;0.8"
                                        dur="1.5s"
                                        repeatCount="indefinite"
                                    />
                                </circle>
                            )}

                            {/* Callsign label */}
                            <text
                                x={position.x}
                                y={position.y - 15}
                                fill={color}
                                fontSize="10"
                                fontWeight="bold"
                                textAnchor="middle"
                                fontFamily="JetBrains Mono, monospace"
                                style={{
                                    textShadow: '0 0 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)',
                                    pointerEvents: 'none'
                                }}
                            >
                                {flight.callsign}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-3 left-3 bg-[#1f222e]/90 backdrop-blur-sm p-3 rounded-lg border border-[#3a3d4a] text-xs">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                    <span className="text-[#8b92a7] font-medium">Arrival</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
                    <span className="text-[#8b92a7] font-medium">Departure</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                    <span className="text-[#8b92a7] font-medium">Emergency</span>
                </div>
            </div>

            {/* Compass */}
            <div className="absolute top-3 right-3 bg-[#1f222e]/90 backdrop-blur-sm p-2 rounded-lg border border-[#3a3d4a]">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-[#fbbf24] font-bold text-xs">N</div>
                    </div>
                    <div className="absolute inset-0 flex items-end justify-center pb-1">
                        <div className="text-[#8b92a7] font-bold text-xs">S</div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-start pl-1">
                        <div className="text-[#8b92a7] font-bold text-xs">W</div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-end pr-1">
                        <div className="text-[#8b92a7] font-bold text-xs">E</div>
                    </div>
                    <svg className="w-full h-full" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="#3a3d4a" strokeWidth="1" />
                        <line x1="24" y1="4" x2="24" y2="12" stroke="#fbbf24" strokeWidth="2" />
                        <polygon points="24,8 22,12 26,12" fill="#fbbf24" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
