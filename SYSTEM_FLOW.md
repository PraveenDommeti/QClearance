# QClearance System Flow Documentation

## Complete System Flow & Integration

### Overview
QClearance is a multi-phase air traffic management system that provides decision integrity through AI analysis and quantum optimization. The system operates in a continuous loop with specific phase transitions.

---

## Phase Details

### Phase 1: Live Monitoring (Continuous)
**Status:** Always Running  
**Components:** `LiveQueueTab`, `RadarView`, `MapView`, `EnhancedRunwayView`

**Features:**
- **Radar View**: Real-time radar sweep showing aircraft positions with animated tracking
- **Map View**: Detailed airport layout with:
  - Taxiway A (Main lane from gates to runway)
  - Taxiway B (Parallel exit lane)
  - Taxiway C (Inner express lane) - **NEW**
  - Runway 08L/26R with threshold markings
  - Gates: A08, B22, D12, C15, A12
  - Enhanced 600px height for better visibility
- **Live Queue**: Shows all active flights with:
  - Status indicators (queued, taxiing, cleared, active, holding)
  - Risk levels (safe, borderline, unsafe)
  - Real-time updates
  - Animation status for takeoff/landing

---

### Phase 2: Slot Requests & Prioritization (Continuous)
**Status:** Always Running  
**Component:** `SlotRequestTab`

**How It Works:**
1. Flights submit slot requests for takeoff/landing/taxi
2. System analyzes multiple requests simultaneously
3. Priority assignment based on:
   - **Fuel Criticality** (< 30% gets highest priority)
   - **Scheduled Time** (delayed flights prioritized)
   - **Traffic Congestion** (avoid gridlock)
   - **Fairness** (prevent slot starvation)

**Example Scenario:**
- 6 flights in queue
- 2 request landing, 4 request takeoff
- System calculates optimal order: `[FNY676 (fuel critical) → ZET3319 (landing) → TWS127 (takeoff) → ...]`

**Integration:**
- Approved requests trigger `createClearance()` in `FlightDataContext`
- Clearance enters monitoring state

---

### Phase 3: Agent Analysis (On-Demand Loop)
**Component:** `AgentAnalysisTab`  
**AI Engine:** `lib/ai.ts` (Google Gemini API)

**Trigger:** User clicks "Start Analysis" or auto-triggered from previous phase

**Process:**
1. **Sequential Analysis** (5 agents run in order):
   - ⛽ Fuel Agent → Checks reserves vs. flight duration
   - ☁️ Weather Agent → Validates visibility and wind
   - 🚧 Congestion Agent → Monitors taxiway density
   - 🛡️ Safety Agent → Separation standards check
   - ⚖️ Fairness Agent → Ensures equitable slot distribution

2. **AI Reasoning:**
   - Each agent sends flight data to Gemini API
   - Receives: `{ result: "safe" | "borderline" | "unsafe", confidence: 0-100, reason: "..." }`
   - Falls back to mock analysis if API key missing

3. **Summary Generation:**
   - Combines all agent results
   - Calculates overall status (worst-case wins)
   - Persists in state (doesn't reset unless re-run)

**Auto-Transition:** Automatically proceeds to Phase 4 after completion (1.5s delay)

---

### Phase 4: Quantum Optimization (Auto-Triggered)
**Component:** `QuantumCheckTab`  
**Algorithm:** `lib/quantum.ts` (Simulated Annealing)

**Trigger:** Auto-triggered after Agent Analysis completes

**Process:**
1. **Encoding Phase**: Converts slot order into optimization problem
2. **Permutation Phase**: Evaluates thousands of alternative orders
3. **Simulation Phase**: Runs Simulated Annealing:
   - **Energy Function:** `E = Σ (fuelPenalty + congestionPenalty + separationPenalty)`
   - **Temperature:** Starts high, gradually cools
   - **Acceptance:** Accepts worse solutions probabilistically to escape local minima

4. **Result:**
   - **Current Total Risk:** Original order score
   - **Optimized Total Risk:** Best-found order score
   - **Improvement:** Risk reduction percentage
   - **Optimized Order:** New slot sequence

**Persistence:** Results remain unless Agent Analysis is re-run

**Auto-Transition:** Automatically proceeds to Phase 5 after completion (2s delay)

---

### Phase 5: Decision Review (Auto-Triggered)
**Component:** `DecisionReviewTab`

**Trigger:** Auto-triggered after Quantum phase completes

**Features:**
- Displays suggested slot order with alerts
- Shows AI agent summaries
- Shows quantum optimization results
- Presents actionable recommendations

**User Actions:**
1. **ApproveRecommendation:**
   - Calls `handleApprove(decisionId)`
   - Creates audit log entry
   - Triggers `onApprove(flightId)` callback
   - **Redirects to Phase 1 (Live Queue)**
   - **Triggers Animation** for approved flight

2. **Reject:**
   - Marks decision as rejected
   - Normal operations continue
   - No animation triggered

**Animation Flow:**
```
Approve → Dashboard.handleDecisionApprove(flightId)
       → setActiveTab("queue")
       → LiveQueueTab receives triggeredFlightId
       → useEffect auto-calls approveFlightClearance(flight)
       → Animation starts (taxi-out → runway → takeoff/landing)
```

---

### Phase 6: Audit & Monitoring (Background)
**Component:** `AuditHistoryTab`

**Features:**
- Immutable log of all system events
- Timeline view of decisions
- Performance analytics
- Alert history

**Event Types:**
- `clearance` - Slot approval/denial
- `decision` - Controller actions
- `agent` - AI analysis results
- `alert` - Critical warnings (fuel, separation)
- `system` - Configuration changes

---

## Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────┐
│  PHASE 1: LIVE MONITORING (Always Running)             │
│  ▶ Radar View   ▶ Map View   ▶ Live Queue             │
│  ▶ Enhanced animations with smooth transitions         │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│  PHASE 2: SLOT REQUESTS (Always Running)               │
│  ▶ Flights request takeoff/landing                     │
│  ▶ Priority assigned by fuel/time/congestion           │
└─────────────────────────────────────────────────────────┘
                          ↓
                    [User Action]
                          ↓
┌─────────────────────────────────────────────────────────┐
│  PHASE 3: AGENT ANALYSIS (On-Demand Loop)              │
│  ▶ Start Analysis → 5 AI Agents                        │
│  ▶ Results persist until re-run                        │
│  ▶ Auto-transition to Quantum after 1.5s               │
└─────────────────────────────────────────────────────────┘
                          ↓ (Auto)
┌─────────────────────────────────────────────────────────┐
│  PHASE 4: QUANTUM OPTIMIZATION (Auto)                  │
│  ▶ Takes Agent Analysis results                        │
│  ▶ Runs Simulated Annealing                            │
│  ▶ Results persist until Agent re-runs                 │
│  ▶ Auto-transition to Decisions after 2s               │
└─────────────────────────────────────────────────────────┘
                          ↓ (Auto)
┌─────────────────────────────────────────────────────────┐
│  PHASE 5: DECISION REVIEW (Auto)                       │
│  ▶ Shows AI + Quantum recommendations                  │
│  ▶ Approve → Redirect to Live Queue + Animate         │
│  ▶ Reject → Normal operations                          │
└─────────────────────────────────────────────────────────┘
        ↓ (If Approved)          ↓ (Loop Back)
┌───────────────────┐    ┌─────────────────────┐
│  Animation Plays  │    │  Re-run Analysis    │
│  in Live Queue    │    │  (Phase 3 Again)    │
└───────────────────┘    └─────────────────────┘
```

---

## Key Implementation Details

### State Persistence
- **Agent Results:** Stored in component state, persists across tab changes
- **Quantum Results:** Stored in component state, cleared only when new analysis runs
- **Decisions:** Managed in `FlightDataContext`, survives tab changes

### Auto-Transition Logic
1. `AgentAnalysisTab` → `onComplete` callback → `Dashboard.handleNextPhase("quantum")`
2. `QuantumCheckTab` → `onComplete` callback → `Dashboard.handleNextPhase("decisions")`
3. `DecisionReviewTab` → `onApprove` callback → `Dashboard.handleDecisionApprove(flightId)` → Switches to "queue" tab

### Animation Triggers
- **Manual:** User clicks approve button on flight in queue
- **Auto:** Decision approval triggers `animatedFlightId` state update
- **Effect:** `LiveQueueTab.useEffect` watches for `triggeredFlightId` changes and calls `approveFlightClearance()`

### Animation Sequence
1. **Takeoff:**
   - taxi-out (gate → taxiway) - 3s
   - runway (taxiway → threshold) - 2s
   - takeoff (accelerate & climb) - 4s

2. **Landing:**
   - runway (approach → touchdown) - 3s
   - taxi-in (exit runway → taxiway) - 2s
   - gate (taxi → parking) - 3s

---

## Environment Setup

**Required:**
```env
VITE_AI_API_KEY=your_gemini_api_key
```

**Optional Fallback:**
- If API key missing, system uses mock AI analysis
- Quantum optimization always runs (no API required)

---

## Usage Guide

### Starting a Complete Analysis Flow:
1. Go to **Live Queue** tab
2. Click on a flight to select it
3. Navigate to **Agent Analysis** tab
4. Click "Start Analysis"
5. Watch automatic progression:  - Agents analyze sequentially
   - Automatically switches to Quantum tab
   - Quantum runs optimization
   - Automatically switches to Decisions tab
6. Review recommendations and approve/reject
7. If approved, watch animation in Live Queue

### Re-running Analysis:
- Click "Reset" in Agent Analysis tab
- Click "Start Analysis" again
- New results replace old results throughout the loop
