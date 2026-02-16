# QClearance MVP - Quick Start Guide

## 🚀 Getting Started

### Access the Application
Open your browser and navigate to: **http://localhost:8081**

---

## 📋 Demo Scenario Walkthrough

### Scenario: Emergency Landing with Multiple Flights

This walkthrough demonstrates the complete QClearance system flow with an emergency landing situation.

---

## Step 1: Initial Setup (Live Queue Tab)

1. **Navigate to Live Queue Tab**
   - You should see existing flights in the queue
   - Each flight shows: callsign, aircraft type, fuel level, status

2. **Observe the Demo Controls Panel** (top of page)
   - Shows quick actions for first 5 flights
   - Each flight has "Edit" and "Emergency" buttons

---

## Step 2: Add Emergency Landing Flight

1. **Click "Add Flight" button** in Demo Controls

2. **Fill in Emergency Flight Details:**
   - Callsign: `EMG001`
   - Aircraft: `B738`
   - Type: `Arrival`
   - Fuel: `25%` (critical level)
   - Gate: `A08`
   - ✅ **Check "Mark as Emergency Landing"**

3. **Click "Add Flight"**
   - Flight appears in queue with red pulsing "EMERGENCY" badge
   - Audit log entry created automatically

---

## Step 3: Add Regular Flights

Add 3 more flights to create a realistic scenario:

**Flight 1 - Landing:**
- Callsign: `ARR123`
- Type: Arrival
- Fuel: `65%`
- Scheduled Time: Set to current time + 3 minutes

**Flight 2 - Takeoff:**
- Callsign: `DEP456`
- Type: Departure
- Fuel: `85%`

**Flight 3 - Landing:**
- Callsign: `ARR789`
- Type: Arrival
- Fuel: `45%`
- Scheduled Time: Set to current time + 4 minutes

---

## Step 4: Observe 5-Minute Window

1. **Check for "READY" badges**
   - Flights within 5-minute window show yellow "READY" badge
   - Emergency flights don't show READY badge (emergency takes precedence)

2. **Edit a flight to test window:**
   - Click "Edit" on any flight
   - Change scheduled time to current time + 2 minutes
   - Save and observe "READY" badge appears

---

## Step 5: View Map with New Features

1. **Switch to Map View**
   - Click "Map View" button

2. **Observe New Infrastructure:**
   - **Taxiway A** (yellow/warning color) - Main lane
   - **Taxiway B** (blue/primary color) - Express lane
   - **Holding Point** - Box marked "HOLD" near runway
   - **Legend** shows "2 TAXIWAYS"

3. **Aircraft Positions:**
   - Departure flights at gates
   - Arrival flights off-screen (appear when approved)

---

## Step 6: Approve Emergency Flight

1. **Select Emergency Flight** (`EMG001`)
   - Click on the flight card

2. **Click "Approve" button**
   - System checks runway availability
   - If clear: Animation starts
   - If blocked: Red alert shows "RUNWAY CONFLICT DETECTED"

3. **Watch Landing Animation:**
   - Aircraft appears at top of runway
   - Rolls down to **holding point** (pauses briefly)
   - Exits to Taxiway A
   - Proceeds to assigned gate
   - Disappears when complete

---

## Step 7: Test Runway Conflict Detection

1. **While emergency flight is landing:**
   - Try to approve another flight
   - System shows: "🚨 RUNWAY CONFLICT DETECTED!"
   - Alert lasts 6 seconds
   - Approval is blocked

2. **Wait for runway to clear:**
   - Emergency flight completes landing
   - Runway becomes available
   - Approve next flight successfully

---

## Step 8: Agent Analysis (Batch Processing)

1. **Navigate to Agent Analysis Tab**

2. **Select Multiple Flights:**
   - System should analyze all 4 flights together
   - Emergency flight automatically gets Priority 1

3. **Click "Start Analysis"**
   - 5 agents analyze sequentially:
     - ⛽ Fuel Agent
     - ☁️ Weather Agent
     - 🚧 Congestion Agent
     - 🛡️ Safety Agent
     - ⚖️ Fairness Agent

4. **Review Results:**
   - Emergency flight flagged as "unsafe" (low fuel)
   - Other flights assessed based on conditions
   - Summary shows reasoning

5. **Auto-Transition:**
   - After 1.5 seconds, automatically moves to Quantum tab

---

## Step 9: Quantum Optimization

1. **Observe Automatic Execution:**
   - Simulated Annealing runs automatically
   - Evaluates thousands of permutations

2. **Review Optimized Order:**
   - Emergency flight should be Position 1
   - Low-fuel flights prioritized
   - Congestion minimized

3. **Check Improvement:**
   - Shows risk reduction percentage
   - Compares current vs. optimized order

4. **Auto-Transition:**
   - After 2 seconds, moves to Decision Review

---

## Step 10: Decision Review

1. **Review Recommendation:**
   - Emergency flight at top of list
   - Clear reasoning provided
   - Risk assessment shown

2. **Approve Decision:**
   - Click "Approve Optimized Order"
   - System redirects to Live Queue
   - Emergency flight animation triggers automatically

3. **Or Reject:**
   - Click "Reject"
   - Flights continue in standard order
   - Decision logged in audit

---

## Step 11: Audit History

1. **Navigate to Audit History Tab**

2. **Review All Events:**
   - Flight additions
   - Emergency toggles
   - Clearance approvals
   - Agent analyses
   - Quantum optimizations
   - Controller decisions

3. **Filter by Type:**
   - System events
   - Clearances
   - Alerts
   - Decisions

---

## 🎯 Key Features to Test

### Emergency System:
- ✅ Add emergency flight
- ✅ Toggle emergency status
- ✅ Verify red pulsing badge
- ✅ Check automatic priority

### 5-Minute Window:
- ✅ Edit scheduled time
- ✅ Verify "READY" badge appears
- ✅ Confirm window calculation

### Demo Controls:
- ✅ Add new flight
- ✅ Edit existing flight
- ✅ Quick emergency toggle
- ✅ Verify audit logging

### Map Enhancements:
- ✅ View Taxiway B
- ✅ Observe holding point
- ✅ Watch landing animation pause
- ✅ Check legend shows 2 taxiways

### Runway Conflict:
- ✅ Approve first flight
- ✅ Try approving second while first on runway
- ✅ Verify conflict alert
- ✅ Wait for clearance

---

## 🐛 Troubleshooting

### Issue: Lint errors in console
**Solution:** These are expected during hot reload. The dev server will recompile and errors will resolve.

### Issue: Demo Controls not visible
**Solution:** Make sure you're on the Live Queue tab. Demo Controls appear at the top.

### Issue: "READY" badge not showing
**Solution:** Check that scheduled time is within 5 minutes of current time. Use Edit function to adjust.

### Issue: Animation doesn't start
**Solution:** Check for runway conflicts. Only one aircraft can use runway at a time.

### Issue: Emergency badge not pulsing
**Solution:** Verify `isEmergency` flag is set. Use Demo Controls to toggle.

---

## 📊 Expected Behavior

### Emergency Flight Priority:
1. Emergency flights always get highest priority
2. Shown with red pulsing badge
3. Automatically elevated in quantum optimization
4. Logged in audit trail

### 5-Minute Window:
1. Flights within window show "READY" badge
2. Window calculated from current time
3. Emergency flights don't show READY (emergency supersedes)
4. Updates dynamically as time progresses

### Animations:
1. **Landing:** runway → holding point → taxi-in → gate → complete
2. **Takeoff:** gate → taxi-out → runway → takeoff → complete
3. Smooth transitions with 700ms cubic-bezier easing
4. Aircraft disappear when complete

### Runway Conflicts:
1. System checks before approving
2. Critical alert if runway in use
3. 6-second alert duration
4. Blocks approval until clear

---

## 🎉 Success Criteria

You've successfully tested the MVP when you can:
- ✅ Add emergency flight and see it prioritized
- ✅ Observe 5-minute window badges
- ✅ Use demo controls to manage flights
- ✅ View both taxiways on map
- ✅ Watch landing animation pause at holding point
- ✅ Trigger and resolve runway conflicts
- ✅ Complete full workflow: Queue → Analysis → Quantum → Decision
- ✅ Review complete audit trail

---

## 🚀 Next Steps

After completing this walkthrough:
1. Experiment with different scenarios
2. Test edge cases (multiple emergencies, full runway queue)
3. Verify all audit logs are captured
4. Check incident replay functionality
5. Test on different screen sizes

---

**Application URL:** http://localhost:8081  
**Documentation:** See `MVP_ENHANCEMENTS.md` for technical details  
**System Flow:** See `SYSTEM_FLOW.md` for complete workflow
