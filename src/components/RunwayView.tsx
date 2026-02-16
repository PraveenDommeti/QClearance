import { Flight } from "@/types/flight";

interface RunwayViewProps {
  flights?: Flight[];
}

export default function RunwayView({ flights = [] }: RunwayViewProps) {
  const positions = [
    { id: 1, y: 10, status: "clear" },
    { id: 2, y: 25, status: flights.some(f => f.status === "active") ? "occupied" : "clear" },
    { id: 3, y: 40, status: "clear" },
    { id: 4, y: 55, status: flights.some(f => f.status === "taxiing") ? "occupied" : "clear" },
    { id: 5, y: 70, status: "clear" },
    { id: 6, y: 85, status: flights.some(f => f.status === "queued") ? "occupied" : "clear" },
  ];

  return (
    <div className="glass-panel p-4 h-full">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
        Runway
      </p>

      <div className="relative h-64 w-12 mx-auto">
        {/* Runway background */}
        <div className="absolute inset-x-0 top-0 bottom-0 bg-secondary/50 rounded-sm">
          {/* Center line */}
          <div className="absolute left-1/2 top-2 bottom-2 w-0.5 -translate-x-1/2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-full h-4 bg-foreground/30 mb-4" />
            ))}
          </div>

          {/* Threshold markings */}
          <div className="absolute top-1 left-1 right-1 h-3 flex gap-0.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-1 bg-foreground/40 rounded-sm" />
            ))}
          </div>
          <div className="absolute bottom-1 left-1 right-1 h-3 flex gap-0.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-1 bg-foreground/40 rounded-sm" />
            ))}
          </div>
        </div>

        {/* Aircraft positions */}
        {positions.map((pos) => (
          <div
            key={pos.id}
            className="absolute left-1/2 -translate-x-1/2 w-3 h-3"
            style={{ top: `${pos.y}%` }}
          >
            {pos.status === "occupied" && (
              <div className="w-full h-full rounded-full bg-primary pulse-dot" />
            )}
          </div>
        ))}

        {/* Scale */}
        <div className="absolute -right-6 top-2 text-[10px] font-mono text-muted-foreground">60</div>
        <div className="absolute -right-6 top-1/2 text-[10px] font-mono text-muted-foreground">27</div>
        <div className="absolute -right-6 bottom-2 text-[10px] font-mono text-muted-foreground">0</div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">08L/26R</p>
      </div>
    </div>
  );
}
