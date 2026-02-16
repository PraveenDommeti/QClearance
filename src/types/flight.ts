export interface Flight {
  id: string;
  callsign: string;
  aircraft: string;
  type: "arrival" | "departure";
  status: "queued" | "taxiing" | "cleared" | "holding" | "active";
  runway: string;
  taxiway?: string;
  gate: string;
  scheduledTime: string;
  actualTime?: string;
  fuel: number;
  speed: number;
  position: { x: number; y: number };
  heading: number;
  airline: string;
  route: string;
  riskLevel: "safe" | "borderline" | "unsafe";
  isEmergency?: boolean; // Emergency landing flag
}

export interface SlotRequest {
  id: string;
  flightId: string;
  callsign: string;
  requestType: "takeoff" | "landing" | "taxi";
  requestedTime: string;
  status: "pending" | "approved" | "denied" | "reviewing";
  priority: number;
  constraints: {
    fuel: number;
    weather: string;
    congestion: string;
  };
  createdAt: string;
}

export interface AgentResult {
  agentId: string;
  name: string;
  status: "pending" | "analyzing" | "complete";
  result?: "safe" | "borderline" | "unsafe";
  confidence?: number;
  reason?: string;
  timestamp?: string;
}

export interface Decision {
  id: string;
  flightId: string;
  callsign: string;
  type: "clearance" | "hold" | "reorder" | "alert";
  recommendation: string;
  status: "pending" | "approved" | "rejected" | "escalated";
  agentAnalysis: AgentResult[];
  quantumCheck?: {
    currentRisk: number;
    optimizedRisk: number;
    suggestedOrder: string[];
  };
  controllerAction?: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  type: "clearance" | "alert" | "decision" | "system" | "agent";
  severity: "info" | "warning" | "critical";
  message: string;
  details?: string;
  actor: string;
}

export type TabId = "queue" | "slots" | "agents" | "quantum" | "decisions" | "audit";

// Authentication Types
export interface User {
  id: string;
  username: string;
  role: "controller" | "supervisor" | "admin";
  name: string;
  badge: string;
  permissions: string[];
}

export interface Session {
  user: User;
  token: string;
  expiresAt: Date;
  lastActivity: Date;
}

// Quantum Analysis Types
export interface QuantumResult {
  id: string;
  timestamp: string;
  currentOrder: SlotOrder[];
  optimizedOrder: SlotOrder[];
  currentTotalRisk: number;
  optimizedTotalRisk: number;
  improvement: number;
  permutationsEvaluated: number;
  biasDetected: boolean;
  issues: QuantumIssue[];
  status: "pending" | "evaluating" | "safe" | "unsafe";
}

export interface SlotOrder {
  position: number;
  callsign: string;
  flightId: string;
  risk: number;
  type: "departure" | "arrival";
  priority: number;
}

export interface QuantumIssue {
  id: string;
  type: "fuel-critical" | "separation" | "fairness" | "timing";
  severity: "warning" | "critical";
  description: string;
  affectedFlights: string[];
  recommendation: string;
}

// Incident Replay Types
export interface IncidentReplay {
  id: string;
  incidentId: string;
  title: string;
  timestamp: string;
  duration: number; // in seconds
  events: ReplayEvent[];
  decisions: Decision[];
  agentAnalyses: AgentResult[][];
  outcome: "resolved" | "escalated" | "risk-accepted";
  summary: string;
}

export interface ReplayEvent {
  id: string;
  timestamp: string;
  type: "flight-update" | "agent-analysis" | "quantum-check" | "decision" | "controller-action" | "system-alert";
  data: Record<string, unknown>;
  description: string;
}

// Alert Types
export interface Alert {
  id: string;
  type: "fuel" | "weather" | "congestion" | "conflict" | "quantum";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  flightIds: string[];
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  autoExpire?: number; // seconds until auto-dismiss
}

// Extended Slot Request with monitoring
export interface MonitoredSlotRequest extends SlotRequest {
  clearanceId?: string;
  monitoringStarted?: string;
  lastEvaluated?: string;
  evaluationCount: number;
  riskHistory: { timestamp: string; riskLevel: string; riskScore: number }[];
}
