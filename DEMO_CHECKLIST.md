# Sky Guardian - Demo Day Checklist

## ✅ Pre-Demo Setup (5 minutes before)

### System Startup
- [ ] Open terminal in project directory
- [ ] Run: `npm run dev`
- [ ] Wait for "ready in XXXms" message
- [ ] Open browser to `http://localhost:8080`
- [ ] Verify dashboard loads without errors

### Browser Configuration
- [ ] Press F11 for full screen
- [ ] Set zoom to 100% (Ctrl+0)
- [ ] Adjust volume to 50-70%
- [ ] Close unnecessary browser tabs
- [ ] Open browser console (F12) - check for errors

### Audio Test
- [ ] Click anywhere on the page (initializes audio)
- [ ] Test sound by toggling emergency on a flight
- [ ] Verify siren + voice announcement plays
- [ ] Adjust volume if needed

### Visual Check
- [ ] Verify all 6 tabs are visible
- [ ] Check Live Queue shows 5 flights
- [ ] Switch to Map View - verify layout
- [ ] Switch to Radar View - verify sweep animation
- [ ] Return to Map View for demo start

### Demo Controls
- [ ] Scroll to Demo Controls panel
- [ ] Verify "Add Flight" form is visible
- [ ] Test adding a flight (then delete it)
- [ ] Verify emergency toggle works

---

## 🎬 Demo Flow Checklist

### Part 1: Introduction (2 min)
- [ ] Welcome jury and introduce Sky Guardian
- [ ] Explain the problem: runway slot decision-making
- [ ] Show dashboard overview
- [ ] Point out 6 main tabs
- [ ] Mention key features: AI agents, quantum optimization, automation

### Part 2: Live Queue & Monitoring (3 min)
- [ ] Show flight queue with 5 flights
- [ ] Explain color coding (green/blue/red)
- [ ] Switch to **Map View**
- [ ] Point out terminal, gates, runways, taxiways
- [ ] Highlight compass and legend
- [ ] Switch to **Radar View**
- [ ] Show rotating sweep and aircraft positions
- [ ] Return to **Map View**

### Part 3: Emergency Detection (3 min)
- [ ] Scroll to Demo Controls
- [ ] Click "Add Flight"
- [ ] Check "Mark as Emergency Landing"
- [ ] Fill: Callsign=EMG999, Aircraft=B738, Fuel=15%
- [ ] Click "Add Flight"
- [ ] **Listen**: Siren + voice announcement
- [ ] **See**: Red toast notification
- [ ] **Verify**: Red aircraft with pulsing ring on map
- [ ] Switch to Radar - verify red "!" symbol
- [ ] Return to Map View

### Part 4: Automated Pipeline (8 min)

#### Agent Analysis (2 min)
- [ ] Navigate to **Agent Analysis** tab
- [ ] Point out pipeline indicator at top
- [ ] Click **"Start Analysis"**
- [ ] Explain 5 agents while analyzing:
  - [ ] Fuel Agent
  - [ ] Weather Agent
  - [ ] Congestion Agent
  - [ ] Safety Agent
  - [ ] Fairness Agent
- [ ] Wait for completion (~10-12s)
- [ ] Show overall status (Safe/Borderline/Unsafe)
- [ ] Highlight emergency flight in results

#### Auto-Transition to Quantum (1 min)
- [ ] **Listen**: Weather alert beeps
- [ ] **See**: Toast notification
- [ ] **Verify**: Auto-switches to Quantum Check tab
- [ ] Point out updated pipeline indicator

#### Quantum Optimization (2 min)
- [ ] Click **"Run Quantum Check"**
- [ ] Explain phases:
  - [ ] Encoding
  - [ ] Permuting
  - [ ] Simulating
  - [ ] Results
- [ ] Wait for completion (~3.5s)
- [ ] Show current vs optimized order
- [ ] Point out risk reduction percentage
- [ ] Highlight emergency flight prioritization

#### Auto-Transition to Decision (1 min)
- [ ] **Listen**: Clearance chime
- [ ] **See**: Toast notification
- [ ] **Verify**: Auto-switches to Decision Review tab
- [ ] Point out pipeline indicator (all green)

#### Decision Review (2 min)
- [ ] Show agent consensus
- [ ] Show quantum recommendation
- [ ] Explain three options: Approve/Reject/Reorder
- [ ] Click **"Approve"** on top flight
- [ ] **Listen**: Clearance chime + voice
- [ ] **See**: Success toast
- [ ] **Verify**: Auto-switches to Live Queue

### Part 5: Flight Animation (4 min)

#### Departure Animation (2 min)
- [ ] Ensure **Map View** is active
- [ ] Select a **departure** flight (green)
- [ ] Click **"Approve"**
- [ ] **Listen**: Clearance chime + voice
- [ ] **Watch animation phases**:
  - [ ] taxi-out (gate → holding)
  - [ ] runway (holding → threshold)
  - [ ] takeoff (accelerate → disappear)
- [ ] Point out progress bar updating
- [ ] Point out phase labels

#### Runway Conflict (2 min)
- [ ] **While animation is running**, try to approve another flight
- [ ] **See**: Red error toast
- [ ] **Read**: "RUNWAY CONFLICT DETECTED"
- [ ] Point out blocking flight callsign
- [ ] Wait for first flight to complete
- [ ] Try approving second flight again
- [ ] **Verify**: Now it works

### Part 6: Continuous Monitoring (2 min) - OPTIONAL
- [ ] Select a flight in Demo Controls
- [ ] Change fuel from 50% to 25%
- [ ] Save - **Listen**: Fuel warning
- [ ] Select another flight
- [ ] Change fuel from 60% to 15%
- [ ] Save - **Listen**: Fuel critical + voice
- [ ] **Verify**: Auto-switches to Agent Analysis
- [ ] **See**: "⚡ Auto-started by continuous monitoring"
- [ ] **Verify**: Analysis starts automatically

### Part 7: Additional Features (2 min) - OPTIONAL
- [ ] Navigate to **Slot Requests** tab
- [ ] Show pending requests
- [ ] Navigate to **Audit History** tab
- [ ] Show audit trail
- [ ] Filter by severity
- [ ] Return to **Live Queue**

---

## 🎤 Key Talking Points

### Safety
- ✅ Multi-agent verification
- ✅ Runway conflict detection
- ✅ Emergency prioritization
- ✅ Real-time monitoring

### Fairness
- ✅ Dedicated Fairness Agent
- ✅ Quantum optimization considers all permutations
- ✅ Transparent reasoning
- ✅ Equal treatment

### Security & Integrity
- ✅ Complete audit trail
- ✅ Human-in-the-loop approval
- ✅ No black-box decisions
- ✅ Quantum verification

### Innovation
- ✅ First to combine multi-agent AI + quantum
- ✅ Fully automated pipeline
- ✅ Real-time visual/audio feedback
- ✅ Scalable architecture

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| No sound | Click page first, check volume |
| Animation stuck | Check for runway conflict message |
| Pipeline doesn't auto-transition | Wait 1.5-2s, check console |
| Emergency not showing | Verify isEmergency flag, refresh |
| Dev server not starting | Check port 8080, run `npm install` |

---

## ⏱️ Time Management

**Total Available**: 20-30 minutes

**Must Show** (15 min):
1. Introduction (2 min)
2. Live Queue + Map (3 min)
3. Emergency Detection (3 min)
4. Automated Pipeline (8 min)
5. Flight Animation (4 min)

**If Time Permits** (5 min):
6. Continuous Monitoring (2 min)
7. Additional Features (2 min)

**Buffer for Q&A**: 5-10 min

---

## 📋 Post-Demo Checklist

- [ ] Thank the jury
- [ ] Ask if there are any questions
- [ ] Be ready to show specific features again
- [ ] Have console open for technical questions
- [ ] Be prepared to explain code architecture

---

## 🎯 Success Criteria

Demo is successful if jury understands:

✅ What Sky Guardian does  
✅ How the automated pipeline works  
✅ Why it ensures safety, fairness, security  
✅ The key innovation (multi-agent + quantum)  
✅ Real-world applicability  

---

**Print this checklist and keep it visible during demo!**
