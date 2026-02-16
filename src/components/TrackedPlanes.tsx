interface TrackedPlane {
  callsign: string;
  aircraft: string;
  size: "S" | "M" | "L";
  runway: string;
}

const planes: TrackedPlane[] = [
  { callsign: "TWS127", aircraft: "A333", size: "M", runway: "008" },
  { callsign: "ZET3319", aircraft: "A364", size: "L", runway: "011" },
  { callsign: "ROT234J", aircraft: "A345", size: "M", runway: "004" },
  { callsign: "FNY676", aircraft: "A313", size: "M", runway: "006" },
  { callsign: "TWS127", aircraft: "A333", size: "M", runway: "008" },
  { callsign: "ZET3319", aircraft: "A364", size: "L", runway: "011" },
];

export default function TrackedPlanes() {
  return (
    <div className="glass-panel p-5">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
        Tracked Planes
      </p>

      <div className="space-y-0">
        {/* Header */}
        <div className="grid grid-cols-4 gap-2 px-3 py-2 text-xs text-muted-foreground uppercase">
          <span>Callsign</span>
          <span>Aircraft</span>
          <span className="text-center">Size</span>
          <span className="text-right">Runway</span>
        </div>

        {/* Rows */}
        {planes.map((plane, idx) => (
          <div
            key={`${plane.callsign}-${idx}`}
            className="data-row grid grid-cols-4 gap-2 text-sm"
          >
            <span className="font-mono font-medium text-foreground">
              {plane.callsign}
            </span>
            <span className="font-mono text-muted-foreground">
              {plane.aircraft}
            </span>
            <span className="text-center text-muted-foreground">{plane.size}</span>
            <span className="text-right font-mono text-primary">{plane.runway}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
