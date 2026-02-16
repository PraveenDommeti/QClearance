import { Flight } from "@/types/flight";
import { useEffect, useState } from "react";

interface RadarViewProps {
  flights?: Flight[];
  onSelectFlight?: (flight: Flight) => void;
}

const defaultFlights: Flight[] = [
  { id: "1", callsign: "ROT234J", aircraft: "A345", type: "arrival", status: "active", runway: "08L", gate: "A08", scheduledTime: "23:10", fuel: 92, speed: 145, position: { x: 30, y: 25 }, heading: 135, airline: "Fly Dubai", route: "DXB → BAH", riskLevel: "safe" },
  { id: "2", callsign: "GW17783", aircraft: "B738", type: "departure", status: "taxiing", runway: "08L", gate: "B22", scheduledTime: "23:15", fuel: 88, speed: 25, position: { x: 55, y: 45 }, heading: 90, airline: "Emirates", route: "DXB → LHR", riskLevel: "safe" },
  { id: "3", callsign: "FNY676", aircraft: "A313", type: "arrival", status: "active", runway: "08R", gate: "D12", scheduledTime: "23:08", fuel: 28, speed: 145, position: { x: 25, y: 55 }, heading: 45, airline: "Qatar", route: "DOH → DXB", riskLevel: "unsafe" },
];

export default function RadarView({ flights = defaultFlights, onSelectFlight }: RadarViewProps) {
  const [time, setTime] = useState(new Date());
  const [sweepAngle, setSweepAngle] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const sweep = setInterval(() => {
      setSweepAngle((prev) => (prev + 1) % 360);
    }, 16);
    return () => clearInterval(sweep);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const degrees = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <div className="glass-panel p-6 radar-glow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Radar View
          </p>
          <p className="text-3xl font-mono font-bold text-foreground">
            {formatTime(time)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium">24°</span>
          </div>
          <select className="bg-secondary/50 text-sm px-3 py-1.5 rounded-lg border-0 outline-none cursor-pointer">
            <option>RADAR VIEW</option>
            <option>MAP VIEW</option>
          </select>
        </div>
      </div>

      {/* Radar Display */}
      <div className="relative aspect-square max-w-md mx-auto">
        {/* Background circles */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
          {/* Concentric circles */}
          {[80, 60, 40, 20].map((r) => (
            <circle
              key={r}
              cx="100"
              cy="100"
              r={r}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
              opacity="0.5"
            />
          ))}

          {/* Cross lines */}
          <line x1="100" y1="10" x2="100" y2="190" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
          <line x1="10" y1="100" x2="190" y2="100" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
          <line x1="29" y1="29" x2="171" y2="171" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
          <line x1="171" y1="29" x2="29" y2="171" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />

          {/* Sweep line */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="20"
            stroke="url(#sweepGradient)"
            strokeWidth="2"
            transform={`rotate(${sweepAngle}, 100, 100)`}
          />

          {/* Sweep cone */}
          <path
            d={`M 100 100 L 85 25 A 80 80 0 0 1 115 25 Z`}
            fill="url(#coneGradient)"
            transform={`rotate(${sweepAngle}, 100, 100)`}
          />

          {/* Center dot */}
          <circle cx="100" cy="100" r="4" fill="hsl(var(--primary))" />

          {/* Gradients */}
          <defs>
            <linearGradient id="sweepGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="coneGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Aircraft */}
          {flights.map((flight) => {
            const isEmergency = flight.isEmergency || flight.riskLevel === "unsafe";
            const color = isEmergency ? "hsl(var(--destructive))" :
              flight.type === "arrival" ? "hsl(0 100% 60%)" : "hsl(var(--primary))";

            return (
              <g
                key={flight.id}
                className="cursor-pointer"
                onClick={() => onSelectFlight?.(flight)}
              >
                <circle
                  cx={(flight.position.x / 100) * 160 + 20}
                  cy={(flight.position.y / 100) * 160 + 20}
                  r="8"
                  fill={color}
                  className="animate-pulse-glow"
                />
                {/* Emergency indicator ring */}
                {isEmergency && (
                  <circle
                    cx={(flight.position.x / 100) * 160 + 20}
                    cy={(flight.position.y / 100) * 160 + 20}
                    r="12"
                    fill="none"
                    stroke="hsl(var(--destructive))"
                    strokeWidth="1.5"
                    strokeDasharray="3,2"
                    opacity="0.8"
                  >
                    <animate
                      attributeName="r"
                      values="12;16;12"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                <text
                  x={(flight.position.x / 100) * 160 + 32}
                  y={(flight.position.y / 100) * 160 + 24}
                  fill={color}
                  fontSize="8"
                  fontFamily="JetBrains Mono"
                >
                  {flight.callsign}
                </text>
                {/* Emergency ! indicator */}
                {isEmergency && (
                  <text
                    x={(flight.position.x / 100) * 160 + 20}
                    y={(flight.position.y / 100) * 160 + 5}
                    fill="hsl(var(--destructive))"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="JetBrains Mono"
                  >
                    !
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Degree labels */}
        {degrees.map((deg) => {
          const rad = (deg - 90) * (Math.PI / 180);
          const x = 50 + 46 * Math.cos(rad);
          const y = 50 + 46 * Math.sin(rad);
          return (
            <span
              key={deg}
              className="absolute text-xs text-muted-foreground font-mono"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {deg}°
            </span>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">TRAFFIC</span>
          <span className="text-2xl font-mono font-bold text-foreground">
            ▲ {flights.length.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-destructive" />
            ARRIVAL
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            DEPARTURE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">ALERTS</span>
          <span className={`text-2xl font-mono font-bold ${flights.some(f => f.riskLevel === "unsafe") ? "text-destructive" : "text-foreground"
            }`}>
            {flights.filter(f => f.riskLevel !== "safe").length.toString().padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  );
}
