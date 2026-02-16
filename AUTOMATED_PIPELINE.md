# Automated Pipeline Flow - Sky Guardian

## Overview

The Sky Guardian system features a **fully automated analysis pipeline** that seamlessly transitions through multiple phases of decision-making. This document explains how the automated flow works and how to use it.

---

## 🔄 Pipeline Phases

The automated pipeline consists of three main phases:

```
1. Agent Analysis → 2. Quantum Optimization → 3. Decision Review
```

### Phase 1: **Agent Analysis**
- **Purpose**: Sequential multi-agent analysis of flight clearance requests
- **Agents**: Fuel, Weather, Congestion, Safety, Fairness
- **Duration**: ~10-12 seconds (2s per agent × 5 agents)
- **Output**: Overall risk assessment (safe/borderline/unsafe)

### Phase 2: **Quantum Optimization**
- **Purpose**: QAOA-style permutation analysis for optimal runway ordering
- **Process**: Encoding → Permuting → Simulating → Results
- **Duration**: ~3.5 seconds
- **Output**: Optimized flight order with risk reduction percentage

### Phase 3: **Decision Review**
- **Purpose**: Final human review and approval
- **Actions**: Approve, Reject, or Reorder flights
- **Output**: Clearance decision and flight animation trigger

---

## ⚡ Automatic Transitions

### How It Works

1. **Agent Analysis Completion**
   - When all 5 agents complete their analysis
   - Waits 1.5 seconds for user to review results
   - **Auto-transitions** to Quantum Optimization tab
   - Plays weather alert sound
   - Shows toast: "✓ Agent Analysis Complete - Proceeding to Quantum Optimization..."

2. **Quantum Optimization Completion**
   - When quantum simulation finishes
   - Waits 2 seconds for user to review optimized order
   - **Auto-transitions** to Decision Review tab
   - Plays clearance chime sound
   - Shows toast: "✓ Quantum Optimization Complete - Proceeding to Decision Review..."

3. **Decision Approval**
   - When user approves a flight in Decision Review
   - **Auto-transitions** back to Live Queue tab
   - Starts flight animation
   - Plays clearance voice announcement

### Visual Indicators

Each tab shows a **pipeline flow indicator** at the top:

```
● Agent Analysis → ○ Quantum Check → ○ Decision Review
```

- **Green dot (●)**: Phase complete
- **Blue pulsing dot**: Phase in progress
- **Gray dot (○)**: Phase pending

---

## 🎯 Triggering the Pipeline

### Method 1: Manual Start
1. Navigate to **Agent Analysis** tab
2. Click **"Start Analysis"** button
3. Watch the automated flow proceed through all phases

### Method 2: Auto-Start via Continuous Monitoring
1. System detects 2+ drift events (fuel drops, weather changes, etc.)
2. **Auto-switches** to Agent Analysis tab
3. **Auto-starts** analysis automatically
4. Shows warning banner: "⚡ Auto-started by continuous monitoring system"
5. Proceeds through entire pipeline automatically

### Method 3: Flight Selection
1. Select a specific flight in Live Queue
2. Navigate to Agent Analysis tab
3. Click "Start Analysis" to analyze that specific flight
4. Pipeline proceeds automatically

---

## 🔊 Sound Effects During Pipeline

The automated pipeline includes audio feedback:

| Event | Sound | Voice |
|-------|-------|-------|
| Analysis Complete | Weather alert beeps | None |
| Quantum Complete | Clearance chime | None |
| Emergency Detected | Urgent siren | "Emergency alert. Flight [callsign] requires immediate attention." |
| Clearance Approved | Ascending chime | "[callsign], cleared for takeoff/landing." |
| Fuel Critical | Descending tones | "Fuel alert. [callsign] at [X] percent fuel." |

---

## 📊 Pipeline State Management

### Global Context
The pipeline uses the **AnalysisContext** to maintain state across tabs:

- **Agent Results**: Stored globally, persists across tab switches
- **Quantum Results**: Stored globally, available in Decision Review
- **Clearances**: Tracked globally, visible in all tabs

### State Persistence
- Results persist even if user manually switches tabs
- Can return to any phase to review results
- "Reset" button clears all pipeline state

---

## 🧪 Testing the Automated Pipeline

### Full Pipeline Test
1. **Start**: Navigate to Agent Analysis tab
2. **Click**: "Start Analysis" button
3. **Observe**:
   - Progress bar fills as agents complete
   - Each agent shows analyzing → complete transition
   - Overall status appears (safe/borderline/unsafe)
4. **Wait**: 1.5 seconds after completion
5. **Auto-transition**: Tab switches to Quantum Check
   - Toast notification appears
   - Weather alert sound plays
6. **Click**: "Run Quantum Check" button
7. **Observe**:
   - Phases progress: Encoding → Permuting → Simulating → Complete
   - Optimized order appears
   - Risk reduction percentage shown
8. **Wait**: 2 seconds after completion
9. **Auto-transition**: Tab switches to Decision Review
   - Toast notification appears
   - Clearance chime plays
10. **Review**: Decision recommendations
11. **Click**: "Approve" on a flight
12. **Auto-transition**: Tab switches to Live Queue
    - Flight animation starts
    - Clearance voice announcement plays

**Total Time**: ~20-25 seconds for complete pipeline

### Auto-Start Test (Continuous Monitoring)
1. **Edit Flight**: Use Demo Controls to change a flight's fuel to 25%
2. **Wait**: Fuel warning sound plays, drift event created
3. **Edit Another**: Change another flight's fuel to 15%
4. **Observe**:
   - Fuel critical sound + voice announcement
   - 2+ drift events accumulated
   - **Auto-switch** to Agent Analysis tab
   - Warning banner appears
   - **Auto-start** analysis begins
5. **Watch**: Entire pipeline proceeds automatically
6. **Result**: Ends at Decision Review, ready for approval

---

## 🎨 Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTOMATED PIPELINE FLOW                   │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  Live Queue Tab  │
│  (User Action)   │
└────────┬─────────┘
         │
         ├─ Manual: Click "Agent Analysis" tab
         ├─ Auto: Continuous monitoring detects 2+ drift events
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 1: AGENT ANALYSIS                                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ● Fuel Agent      → Analyzing... → ✓ Complete (85%)   │  │
│  │ ● Weather Agent   → Analyzing... → ✓ Complete (92%)   │  │
│  │ ● Congestion Agent→ Analyzing... → ✓ Complete (78%)   │  │
│  │ ● Safety Agent    → Analyzing... → ✓ Complete (88%)   │  │
│  │ ● Fairness Agent  → Analyzing... → ✓ Complete (91%)   │  │
│  └────────────────────────────────────────────────────────┘  │
│  Overall Status: SAFE / BORDERLINE / UNSAFE                  │
│  Duration: ~10-12 seconds                                    │
└────────┬─────────────────────────────────────────────────────┘
         │
         │ ⏱️  Wait 1.5s
         │ 🔊 Weather alert sound
         │ 💬 Toast: "Agent Analysis Complete"
         │
         ▼ AUTO-TRANSITION
┌──────────────────────────────────────────────────────────────┐
│  PHASE 2: QUANTUM OPTIMIZATION                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 01 Encode Order    → ✓ Complete                        │  │
│  │ 02 Generate Perms  → ✓ Complete (1,234 permutations)  │  │
│  │ 03 Quantum Sim     → ✓ Complete                        │  │
│  │ 04 Results         → ✓ Complete                        │  │
│  └────────────────────────────────────────────────────────┘  │
│  Current Risk: 67% → Optimized Risk: 34% (-33% improvement) │
│  Duration: ~3.5 seconds                                      │
└────────┬─────────────────────────────────────────────────────┘
         │
         │ ⏱️  Wait 2s
         │ 🔊 Clearance chime
         │ 💬 Toast: "Quantum Optimization Complete"
         │
         ▼ AUTO-TRANSITION
┌──────────────────────────────────────────────────────────────┐
│  PHASE 3: DECISION REVIEW                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Flight: TWS127                                         │  │
│  │ Recommendation: APPROVE                                │  │
│  │ Agent Consensus: 4/5 Safe, 1/5 Borderline             │  │
│  │ Quantum Suggests: Position #2 in optimized order      │  │
│  │                                                        │  │
│  │ [Approve] [Reject] [Reorder]                          │  │
│  └────────────────────────────────────────────────────────┘  │
│  User Decision Required                                      │
└────────┬─────────────────────────────────────────────────────┘
         │
         │ USER CLICKS "APPROVE"
         │ 🔊 Clearance chime + voice
         │ 💬 Toast: "Clearance Approved"
         │
         ▼ AUTO-TRANSITION
┌──────────────────┐
│  Live Queue Tab  │
│  (Animation)     │
│  ✈️ Flight starts│
│  takeoff/landing │
└──────────────────┘
```

---

## 🛠️ Configuration

### Timing Adjustments

**Agent Analysis Transition Delay** (in `AgentAnalysisTab.tsx`):
```typescript
setTimeout(onComplete, 1500); // Currently 1.5 seconds
```

**Quantum Optimization Transition Delay** (in `QuantumCheckTab.tsx`):
```typescript
setTimeout(onComplete, 2000); // Currently 2 seconds
```

**Auto-Start Delay** (in `AgentAnalysisTab.tsx`):
```typescript
setTimeout(() => startAnalysis(), 500); // Currently 0.5 seconds
```

### Disabling Auto-Transitions

To disable automatic transitions, simply remove the `onComplete` prop:

**In `Dashboard.tsx`**:
```typescript
// With auto-transition (current):
<AgentAnalysisTab flight={selectedFlight} onComplete={() => handleNextPhase("quantum")} />

// Without auto-transition:
<AgentAnalysisTab flight={selectedFlight} />
```

---

## 🐛 Troubleshooting

### Pipeline doesn't auto-transition
- **Check**: Ensure `onComplete` prop is passed to tabs
- **Check**: Console logs for completion messages
- **Check**: No errors in browser console

### Auto-start doesn't work
- **Check**: `autoStart` prop is set to `true`
- **Check**: Flights are available for analysis
- **Check**: Not already analyzing or complete

### Sound effects don't play
- **Check**: User has clicked somewhere on page (browser autoplay policy)
- **Check**: Sound effects not muted
- **Check**: Browser supports Web Audio API

---

## 📝 Code References

### Key Files
- **`src/pages/Dashboard.tsx`**: Pipeline orchestration, tab transitions
- **`src/components/tabs/AgentAnalysisTab.tsx`**: Phase 1, auto-start logic
- **`src/components/tabs/QuantumCheckTab.tsx`**: Phase 2, optimization
- **`src/components/tabs/DecisionReviewTab.tsx`**: Phase 3, final approval
- **`src/contexts/AnalysisContext.tsx`**: Global state management
- **`src/lib/soundEffects.ts`**: Audio feedback system

### Key Functions
- **`handleNextPhase()`**: Manages tab transitions with sound/toast
- **`startAnalysis()`**: Initiates agent analysis
- **`runOptimization()`**: Starts quantum optimization
- **`onApprove()`**: Handles decision approval

---

## ✅ Success Criteria

The automated pipeline is working correctly when:

✅ Agent Analysis completes and auto-transitions to Quantum Check  
✅ Quantum Optimization completes and auto-transitions to Decision Review  
✅ Sound effects play at each transition  
✅ Toast notifications appear with appropriate messages  
✅ Pipeline flow indicator updates correctly  
✅ Auto-start works when triggered by continuous monitoring  
✅ Decision approval returns to Live Queue and starts animation  
✅ No console errors during pipeline execution  

---

**Implementation Status**: ✅ COMPLETE  
**Testing Status**: ⏳ READY FOR USER TESTING  
**Documentation**: ✅ COMPLETE
