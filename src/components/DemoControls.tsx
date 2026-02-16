import { Flight } from "@/types/flight";
import { AlertTriangle, Edit, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DemoControlsProps {
    flights: Flight[];
    onUpdateFlight: (flightId: string, updates: Partial<Flight>) => void;
    onAddFlight: (flight: Omit<Flight, "id">) => void;
}

export default function DemoControls({ flights, onUpdateFlight, onAddFlight }: DemoControlsProps) {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

    const [newFlight, setNewFlight] = useState({
        callsign: "",
        aircraft: "B738",
        type: "arrival" as "arrival" | "departure",
        status: "queued" as const,
        runway: "08L",
        gate: "A08",
        scheduledTime: new Date().toTimeString().slice(0, 5),
        fuel: 75,
        speed: 0,
        airline: "Demo Airlines",
        route: "DXB → MCT",
        riskLevel: "safe" as const,
        isEmergency: false,
    });

    const handleAddFlight = () => {
        if (!newFlight.callsign.trim()) {
            toast.error("Callsign is required");
            return;
        }

        const flight: Omit<Flight, "id"> = {
            ...newFlight,
            position: newFlight.type === "departure" ? { x: 15, y: 50 } : { x: 90, y: 15 },
            heading: newFlight.type === "departure" ? 90 : 225,
        };

        onAddFlight(flight);
        toast.success(`Flight ${newFlight.callsign} added`);
        setShowAddDialog(false);

        // Reset form
        setNewFlight({
            ...newFlight,
            callsign: "",
            fuel: 75,
            isEmergency: false,
        });
    };

    const handleEditFlight = () => {
        if (!selectedFlight) return;

        onUpdateFlight(selectedFlight.id, {
            fuel: selectedFlight.fuel,
            isEmergency: selectedFlight.isEmergency,
            riskLevel: selectedFlight.riskLevel,
            scheduledTime: selectedFlight.scheduledTime,
        });

        toast.success(`Flight ${selectedFlight.callsign} updated`);
        setShowEditDialog(false);
        setSelectedFlight(null);
    };

    const toggleEmergency = (flight: Flight) => {
        const newEmergencyStatus = !flight.isEmergency;
        onUpdateFlight(flight.id, {
            isEmergency: newEmergencyStatus,
            riskLevel: newEmergencyStatus ? "unsafe" : "safe",
        });

        toast.warning(
            newEmergencyStatus
                ? `🚨 ${flight.callsign} marked as EMERGENCY`
                : `✓ ${flight.callsign} emergency cleared`,
            { duration: 4000 }
        );
    };

    return (
        <div className="glass-panel p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Demo Controls</h3>
                    <p className="text-xs text-muted-foreground">Manage flights for testing</p>
                </div>
                <button
                    onClick={() => setShowAddDialog(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary text-xs font-medium rounded-lg transition-all border border-primary/30"
                >
                    <Plus className="w-3 h-3" />
                    Add Flight
                </button>
            </div>

            {/* Quick Emergency Toggles */}
            <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Quick Actions</p>
                {flights.slice(0, 5).map((flight) => (
                    <div
                        key={flight.id}
                        className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg border border-transparent hover:border-primary/20 transition-all"
                    >
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-foreground">{flight.callsign}</span>
                            {flight.isEmergency && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-destructive/20 text-destructive text-xs rounded border border-destructive/30">
                                    <AlertTriangle className="w-3 h-3" />
                                    EMERGENCY
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setSelectedFlight(flight);
                                    setShowEditDialog(true);
                                }}
                                className="p-1.5 hover:bg-primary/20 rounded transition-all"
                                title="Edit Flight"
                            >
                                <Edit className="w-3 h-3 text-muted-foreground hover:text-primary" />
                            </button>
                            <button
                                onClick={() => toggleEmergency(flight)}
                                className={`px-2 py-1 text-xs font-medium rounded transition-all ${flight.isEmergency
                                        ? "bg-destructive/20 text-destructive border border-destructive/30"
                                        : "bg-warning/20 text-warning border border-warning/30"
                                    }`}
                            >
                                {flight.isEmergency ? "Clear" : "Emergency"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Flight Dialog */}
            {showAddDialog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="glass-panel p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-foreground">Add New Flight</h3>
                            <button onClick={() => setShowAddDialog(false)} className="p-1 hover:bg-secondary rounded">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-muted-foreground">Callsign</label>
                                <input
                                    type="text"
                                    value={newFlight.callsign}
                                    onChange={(e) => setNewFlight({ ...newFlight, callsign: e.target.value.toUpperCase() })}
                                    className="w-full px-3 py-2 bg-secondary/50 border border-white/10 rounded-lg text-sm font-mono"
                                    placeholder="ABC123"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-muted-foreground">Aircraft</label>
                                    <select
                                        value={newFlight.aircraft}
                                        onChange={(e) => setNewFlight({ ...newFlight, aircraft: e.target.value })}
                                        className="w-full px-3 py-2 bg-secondary/50 border border-white/10 rounded-lg text-sm"
                                    >
                                        <option value="B738">B738</option>
                                        <option value="A320">A320</option>
                                        <option value="B777">B777</option>
                                        <option value="A333">A333</option>
                                        <option value="B787">B787</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs text-muted-foreground">Type</label>
                                    <select
                                        value={newFlight.type}
                                        onChange={(e) => setNewFlight({ ...newFlight, type: e.target.value as "arrival" | "departure" })}
                                        className="w-full px-3 py-2 bg-secondary/50 border border-white/10 rounded-lg text-sm"
                                    >
                                        <option value="arrival">Arrival</option>
                                        <option value="departure">Departure</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-muted-foreground">Fuel %</label>
                                    <input
                                        type="number"
                                        min="10"
                                        max="100"
                                        value={newFlight.fuel}
                                        onChange={(e) => setNewFlight({ ...newFlight, fuel: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 bg-secondary/50 border border-white/10 rounded-lg text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-muted-foreground">Gate</label>
                                    <select
                                        value={newFlight.gate}
                                        onChange={(e) => setNewFlight({ ...newFlight, gate: e.target.value })}
                                        className="w-full px-3 py-2 bg-secondary/50 border border-white/10 rounded-lg text-sm"
                                    >
                                        <option value="A08">A08</option>
                                        <option value="B22">B22</option>
                                        <option value="D12">D12</option>
                                        <option value="C15">C15</option>
                                        <option value="A12">A12</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="emergency"
                                    checked={newFlight.isEmergency}
                                    onChange={(e) => setNewFlight({ ...newFlight, isEmergency: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="emergency" className="text-sm text-warning flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Mark as Emergency Landing
                                </label>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setShowAddDialog(false)}
                                    className="flex-1 px-4 py-2 bg-secondary/50 hover:bg-secondary text-sm rounded-lg transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddFlight}
                                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition-all"
                                >
                                    Add Flight
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Flight Dialog */}
            {showEditDialog && selectedFlight && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="glass-panel p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-foreground">Edit Flight {selectedFlight.callsign}</h3>
                            <button onClick={() => setShowEditDialog(false)} className="p-1 hover:bg-secondary rounded">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-muted-foreground">Fuel %</label>
                                <input
                                    type="number"
                                    min="10"
                                    max="100"
                                    value={selectedFlight.fuel}
                                    onChange={(e) => setSelectedFlight({ ...selectedFlight, fuel: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 bg-secondary/50 border border-white/10 rounded-lg text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-muted-foreground">Scheduled Time</label>
                                <input
                                    type="time"
                                    value={selectedFlight.scheduledTime}
                                    onChange={(e) => setSelectedFlight({ ...selectedFlight, scheduledTime: e.target.value })}
                                    className="w-full px-3 py-2 bg-secondary/50 border border-white/10 rounded-lg text-sm"
                                />
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="edit-emergency"
                                    checked={selectedFlight.isEmergency || false}
                                    onChange={(e) => setSelectedFlight({ ...selectedFlight, isEmergency: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="edit-emergency" className="text-sm text-warning flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Mark as Emergency
                                </label>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setShowEditDialog(false)}
                                    className="flex-1 px-4 py-2 bg-secondary/50 hover:bg-secondary text-sm rounded-lg transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditFlight}
                                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition-all"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
