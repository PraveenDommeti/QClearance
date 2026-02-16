import { useFlightData } from "@/contexts/FlightDataContext";
import { mockSlotRequests } from "@/data/mockData";
import { SlotRequest } from "@/types/flight";
import { AlertTriangle, ArrowRight, CheckCircle, Clock, Cloud, Fuel, Users, XCircle } from "lucide-react";
import { useState } from "react";

export default function SlotRequestTab() {
  const [requests, setRequests] = useState<SlotRequest[]>(mockSlotRequests);
  const [selectedRequest, setSelectedRequest] = useState<SlotRequest | null>(null);
  const { flights, createClearance } = useFlightData();

  const handleApprove = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "approved" as const } : r));

    // Create clearance in the system
    const request = requests.find(r => r.id === id);
    if (request) {
      const flight = flights.find(f => f.id === request.flightId);
      if (flight) {
        createClearance(flight);
      }
    }
  };

  const handleDeny = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "denied" as const } : r));
  };

  const getStatusIcon = (status: SlotRequest["status"]) => {
    switch (status) {
      case "approved": return <CheckCircle className="w-4 h-4 text-success" />;
      case "denied": return <XCircle className="w-4 h-4 text-destructive" />;
      case "reviewing": return <AlertTriangle className="w-4 h-4 text-warning" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRequestTypeBadge = (type: SlotRequest["requestType"]) => {
    const colors = {
      takeoff: "bg-primary/20 text-primary border-primary/30",
      landing: "bg-destructive/20 text-destructive border-destructive/30",
      taxi: "bg-warning/20 text-warning border-warning/30",
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded border ${colors[type]}`}>
        {type.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Request Queue */}
      <div className="col-span-12 lg:col-span-7">
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Slot Requests</h3>
              <p className="text-xs text-muted-foreground">Pending clearance decisions</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium">{requests.filter(r => r.status === "pending").length} Pending</span>
            </div>
          </div>

          <div className="space-y-3">
            {requests.map((request) => {
              const flight = flights.find(f => f.id === request.flightId);
              return (
                <div
                  key={request.id}
                  onClick={() => setSelectedRequest(request)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${selectedRequest?.id === request.id
                      ? "bg-primary/10 border-primary/50"
                      : "bg-secondary/30 border-transparent hover:border-primary/30"
                    }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <p className="font-mono font-bold text-foreground">{request.callsign}</p>
                        <p className="text-xs text-muted-foreground">Request #{request.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRequestTypeBadge(request.requestType)}
                      <span className="text-xs text-muted-foreground">P{request.priority}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Requested:</span>
                      <span className="font-mono text-foreground">{request.requestedTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Fuel className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Fuel:</span>
                      <span className={`font-mono ${request.constraints.fuel < 30 ? "text-destructive" : "text-foreground"}`}>
                        {request.constraints.fuel}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Traffic:</span>
                      <span className={`font-mono capitalize ${request.constraints.congestion === "high" ? "text-warning" : "text-foreground"
                        }`}>
                        {request.constraints.congestion}
                      </span>
                    </div>
                  </div>

                  {request.status === "pending" && (
                    <div className="flex gap-2 pt-3 border-t border-white/10">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleApprove(request.id); }}
                        className="flex-1 py-2 bg-success/20 text-success text-sm font-medium rounded-lg 
                                   hover:bg-success/30 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeny(request.id); }}
                        className="flex-1 py-2 bg-destructive/20 text-destructive text-sm font-medium rounded-lg 
                                   hover:bg-destructive/30 transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Deny
                      </button>
                    </div>
                  )}

                  {request.status === "reviewing" && (
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex items-center gap-2 text-xs text-warning">
                        <AlertTriangle className="w-4 h-4" />
                        Agent analysis in progress...
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Request Details */}
      <div className="col-span-12 lg:col-span-5">
        <div className="glass-panel p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">Request Details</h3>

          {selectedRequest ? (
            <div className="space-y-4">
              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-mono font-bold text-foreground">{selectedRequest.callsign}</span>
                  {getRequestTypeBadge(selectedRequest.requestType)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Request ID</span>
                    <span className="font-mono text-foreground">{selectedRequest.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created At</span>
                    <span className="font-mono text-foreground">{selectedRequest.createdAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Priority Level</span>
                    <span className="font-mono text-primary">P{selectedRequest.priority}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-secondary/30 rounded-lg">
                <h4 className="text-sm font-medium text-foreground mb-3">Constraints Snapshot</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Fuel className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Fuel State</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${selectedRequest.constraints.fuel < 30 ? "bg-destructive" :
                                selectedRequest.constraints.fuel < 50 ? "bg-warning" : "bg-success"
                              }`}
                            style={{ width: `${selectedRequest.constraints.fuel}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono">{selectedRequest.constraints.fuel}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Cloud className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Weather Conditions</p>
                      <p className="text-sm text-foreground">{selectedRequest.constraints.weather}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Traffic Congestion</p>
                      <p className={`text-sm capitalize ${selectedRequest.constraints.congestion === "high" ? "text-warning" : "text-foreground"
                        }`}>
                        {selectedRequest.constraints.congestion}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Decision Flow</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-1 bg-secondary rounded text-foreground">Request</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <span className="px-2 py-1 bg-secondary rounded text-foreground">Analysis</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <span className="px-2 py-1 bg-primary/30 rounded text-primary">Decision</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              Select a request to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
