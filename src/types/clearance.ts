import { Flight, AgentResult } from "./flight";

export interface ClearanceConditions {
  fuel: number;
  weather: string;
  congestion: string;
  visibility: number;
  wind: string;
  timestamp: string;
}

export interface Clearance {
  id: string;
  flightId: string;
  callsign: string;
  type: "takeoff" | "landing" | "taxi";
  status: "under-monitoring" | "safe" | "warning" | "critical" | "completed";
  issuedAt: string;
  conditions: ClearanceConditions;
  agentAnalysis?: AgentResult[];
  riskLevel: "safe" | "borderline" | "unsafe";
  riskScore: number;
  lastEvaluated: string;
  evaluationCount: number;
}
