import { Plane } from "lucide-react";

interface FlightDetailsProps {
  flight?: {
    id: string;
    callsign: string;
    route: string;
    date: string;
    departureTime: string;
    gate: string;
    airline: string;
    status: "safe" | "warning" | "danger";
    fuel: number;
    speed: number;
  };
}

const defaultFlight = {
  id: "GW177899",
  callsign: "GW177899",
  route: "DXB → MCT",
  date: "AUG 12 2023",
  departureTime: "23:00",
  gate: "B17",
  airline: "Emirates",
  status: "safe" as const,
  fuel: 85,
  speed: 280,
};

export default function FlightDetails({ flight = defaultFlight }: FlightDetailsProps) {
  return (
    <div className="glass-panel p-5">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
        Selected Flight
      </p>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-mono font-bold text-foreground">
            {flight.callsign}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-md">
              {flight.route}
            </span>
            <span className="text-xs text-muted-foreground">{flight.date}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-1">{flight.airline}</p>
          <div className="w-16 h-12 bg-white/10 rounded-lg flex items-center justify-center">
            <Plane className="w-8 h-8 text-foreground" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase">Departure Time</p>
          <p className="text-3xl font-mono font-bold text-foreground">
            {flight.departureTime}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase">Gate</p>
          <p className="text-3xl font-mono font-bold text-foreground">
            {flight.gate}
          </p>
        </div>
      </div>

      {/* Aircraft visualization */}
      <div className="relative h-20 bg-secondary/30 rounded-lg overflow-hidden mb-4">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 120 40" className="w-32 h-12">
            <path
              d="M10 20 L30 20 L40 10 L50 10 L55 20 L90 20 L100 15 L110 15 L110 25 L100 25 L90 20 L55 20 L50 30 L40 30 L30 20"
              fill="none"
              stroke="hsl(var(--foreground))"
              strokeWidth="1.5"
            />
          </svg>
        </div>
        <div className="absolute right-4 top-2 flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[10px] text-muted-foreground">SPEED</span>
          </div>
          <span className="text-xs font-mono">{flight.speed}</span>
        </div>
        <div className="absolute right-4 bottom-2 flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-[10px] text-muted-foreground">FUEL</span>
          </div>
          <span className="text-xs font-mono">{flight.fuel}%</span>
        </div>
      </div>

      {/* Status indicator */}
      <div
        className={`flex items-center justify-center gap-2 py-2 rounded-lg border ${
          flight.status === "safe"
            ? "status-safe"
            : flight.status === "warning"
            ? "status-warning"
            : "status-danger"
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            flight.status === "safe"
              ? "bg-success"
              : flight.status === "warning"
              ? "bg-warning"
              : "bg-destructive"
          }`}
        />
        <span className="text-sm font-medium uppercase">
          {flight.status === "safe"
            ? "Clearance Safe"
            : flight.status === "warning"
            ? "Review Required"
            : "Safety Alert"}
        </span>
      </div>
    </div>
  );
}
