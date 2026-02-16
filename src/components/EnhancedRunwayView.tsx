import { Flight } from "@/types/flight";
import { FlightAnimation } from "@/components/MapView";
import { Plane } from "lucide-react";

interface EnhancedRunwayViewProps {
  flights: Flight[];
  animatingFlights?: Map<string, FlightAnimation>;
}

export default function EnhancedRunwayView({ flights, animatingFlights }: EnhancedRunwayViewProps) {
  // Get active animations on runway
  const runwayAnimations = animatingFlights 
    ? Array.from(animatingFlights.entries()).filter(([_, anim]) => 
        anim.phase === "runway" || anim.phase === "takeoff"
      )
    : [];

  const getRunwayPosition = (animation: FlightAnimation) => {
    if (animation.type === "takeoff") {
      if (animation.phase === "runway") {
        return 85 - (animation.progress * 0.1); // Move to runway
      } else if (animation.phase === "takeoff") {
        return 75 - (animation.progress * 0.7); // Takeoff roll
      }
    } else if (animation.type === "landing") {
      if (animation.phase === "runway") {
        return 10 + (animation.progress * 0.65); // Landing roll
      }
    }
    return 50;
  };

  return (
    <div className="glass-panel p-4 h-full">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
        Runway 08L/26R
      </p>

      <div className="relative h-80 w-16 mx-auto">
        {/* Runway background */}
        <div className="absolute inset-x-0 top-0 bottom-0 bg-secondary/50 rounded-sm border border-border/50">
          {/* Center line dashes */}
          <div className="absolute left-1/2 top-4 bottom-4 w-0.5 -translate-x-1/2 flex flex-col gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-full h-4 bg-foreground/30" />
            ))}
          </div>

          {/* Threshold markings - top */}
          <div className="absolute top-2 left-1 right-1 h-4 flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-1 bg-foreground/40 rounded-sm" />
            ))}
          </div>

          {/* Threshold markings - bottom */}
          <div className="absolute bottom-2 left-1 right-1 h-4 flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-1 bg-foreground/40 rounded-sm" />
            ))}
          </div>

          {/* Runway designation */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2">
            <span className="text-[10px] font-mono font-bold text-foreground/60">08L</span>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <span className="text-[10px] font-mono font-bold text-foreground/60">26R</span>
          </div>
        </div>

        {/* Static aircraft positions */}
        {flights.filter(f => f.status === "active" || f.status === "cleared").map((flight) => {
          const animation = animatingFlights?.get(flight.id);
          if (animation) return null; // Skip if animating

          return (
            <div
              key={flight.id}
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: flight.type === "arrival" ? "20%" : "75%" }}
            >
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                flight.type === "departure" ? "bg-primary/30" : "bg-arrival/30"
              }`}>
                <Plane className={`w-3 h-3 ${
                  flight.type === "departure" ? "text-primary rotate-0" : "text-arrival rotate-180"
                }`} />
              </div>
            </div>
          );
        })}

        {/* Animated aircraft on runway */}
        {runwayAnimations.map(([flightId, animation]) => {
          const flight = flights.find(f => f.id === flightId);
          if (!flight) return null;

          const position = getRunwayPosition(animation);
          const isDeparture = animation.type === "takeoff";

          return (
            <div
              key={flightId}
              className="absolute left-1/2 -translate-x-1/2 transition-all duration-200 ease-linear"
              style={{ top: `${position}%` }}
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 w-6 h-6 -translate-x-1 -translate-y-1 rounded-full blur-md ${
                isDeparture ? "bg-primary/50" : "bg-arrival/50"
              } animate-pulse`} />
              
              {/* Aircraft */}
              <div className={`relative w-4 h-4 rounded-full flex items-center justify-center ${
                isDeparture ? "bg-primary" : "bg-arrival"
              }`}>
                <Plane className={`w-3 h-3 text-background ${
                  isDeparture ? "rotate-0" : "rotate-180"
                }`} />
              </div>

              {/* Trail effect for takeoff */}
              {animation.phase === "takeoff" && animation.progress > 50 && (
                <div className="absolute left-1/2 -translate-x-1/2 top-5 w-1 h-8 bg-gradient-to-b from-primary/50 to-transparent" />
              )}
            </div>
          );
        })}

        {/* Scale markers */}
        <div className="absolute -right-8 top-2 text-[10px] font-mono text-muted-foreground">3000m</div>
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground">1500m</div>
        <div className="absolute -right-8 bottom-2 text-[10px] font-mono text-muted-foreground">0m</div>

        {/* Holding position indicator */}
        <div className="absolute -left-2 bottom-[18%] w-[calc(100%+16px)] h-0.5 bg-warning/50" />
        <div className="absolute -left-6 bottom-[16%] text-[8px] font-mono text-warning">HOLD</div>
      </div>

      {/* Status */}
      <div className="mt-4 text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          {runwayAnimations.length > 0 ? (
            <>
              <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
              <span className="text-xs text-warning font-medium">ACTIVE</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-xs text-success font-medium">CLEAR</span>
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {runwayAnimations.length} aircraft on runway
        </p>
      </div>
    </div>
  );
}
