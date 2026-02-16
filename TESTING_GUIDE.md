# Testing Guide - Taxiway Path-Following Fix

## Quick Start

The development server is running at: **http://localhost:8080**

## What Was Fixed

### 1. ✅ Taxiway Path-Following
Aircraft now follow exact L-shaped paths along taxiway centerlines instead of cutting diagonally across the map.

### 2. ✅ Single-Runway Logic (Already Working)
Only one aircraft can use the runway at a time, with audio and visual alerts for conflicts.

---

## Step-by-Step Testing

### Test 1: Departure Path-Following

1. **Navigate to Live Queue Tab**
   - Open http://localhost:8080
   - Click on "Live Queue" tab (should be default)

2. **Approve a Departure Flight**
   - Look for a flight with type "DEP" (green icon)
   - Click the "Approve" button
   - Watch the map view on the left

3. **Observe the Path** ✨
   - **Phase 1 (taxi-out)**: Aircraft should move:
     - First: Horizontally from gate to TWY A (vertical line at X=170)
     - Then: Vertically along TWY A to cross taxiway (horizontal line at Y=200)
     - **Expected**: Clear L-shaped path, no diagonal shortcuts
   
   - **Phase 2 (runway)**: Aircraft should move:
     - Horizontally from holding position to runway
     - Then vertically to runway threshold
   
   - **Phase 3 (takeoff)**: Aircraft accelerates down runway

4. **Success Criteria**
   - ✅ Aircraft follows yellow taxiway centerlines
   - ✅ Clear 90-degree turn visible at TWY A intersection
   - ✅ No diagonal movement through apron/grass areas
   - ✅ Smooth animation with progress bar

---

### Test 2: Arrival Path-Following

1. **Approve an Arrival Flight**
   - Look for a flight with type "ARR" (blue icon)
   - Click the "Approve" button
   - Watch the map view

2. **Observe the Path** ✨
   - **Phase 1 (runway)**: Aircraft lands and rolls to taxiway exit
   
   - **Phase 2 (taxi-in)**: Aircraft exits runway horizontally to TWY A
   
   - **Phase 3 (gate)**: Aircraft should move:
     - First: Vertically along TWY A from cross taxiway to gate level
     - Then: Horizontally from TWY A to assigned gate
     - **Expected**: Reverse L-shaped path

3. **Success Criteria**
   - ✅ Aircraft follows taxiway centerlines
   - ✅ L-shaped path visible (vertical then horizontal)
   - ✅ Arrives at correct gate position
   - ✅ Smooth transitions between phases

---

### Test 3: Single-Runway Enforcement

1. **Approve First Flight**
   - Click "Approve" on any flight
   - Wait for it to reach the runway phase (progress bar shows "On Runway")

2. **Try to Approve Second Flight** 🚨
   - While first flight is on runway, try to approve another flight
   - Click "Approve" button on a different flight

3. **Expected Behavior**
   - ❌ Approval should be blocked
   - 🔊 Emergency alert sound should play
   - 📢 Toast notification should appear:
     ```
     🚨 RUNWAY CONFLICT DETECTED!
     Runway is in use by [CALLSIGN]. Wait for it to clear...
     ```
   - Console should log: `[RUNWAY CONFLICT] Blocked...`

4. **Wait for Clearance**
   - Wait for first flight to complete runway phase
   - Status should change to "CLEAR" in runway view
   - Now you can approve the second flight

5. **Success Criteria**
   - ✅ Only one aircraft on runway at a time
   - ✅ Audio alert plays on conflict
   - ✅ Visual feedback via toast notification
   - ✅ Second flight can proceed after first clears

---

### Test 4: Emergency Flight Priority

1. **Add Emergency Flight**
   - Use Demo Controls panel
   - Click "Add Emergency Flight"
   - Emergency flight should appear with red badge "EMERGENCY"

2. **Observe Behavior**
   - 🔊 Emergency alert announcement should play
   - 📢 Toast notification: "🚨 EMERGENCY: [CALLSIGN]"
   - Flight should have pulsing red indicator

3. **Approve Emergency**
   - Click "Approve" on emergency flight
   - Should follow same L-shaped taxiway paths
   - Should still respect runway conflicts

---

## Visual Indicators

### Map View
- **Yellow dashed lines**: Taxiway centerlines
- **White dashed line**: Runway centerline
- **Aircraft colors**:
  - 🟢 Green: Departure
  - 🔵 Blue: Arrival
  - 🔴 Red: Emergency

### Animation Phases
- **taxi-out/taxi-in**: Moving along taxiways
- **runway**: On runway surface
- **takeoff**: Accelerating for departure
- **gate**: Approaching gate
- **complete**: Animation finished

### Progress Bar
- Shows current phase name
- Fills from 0% to 100% per phase
- Pulses with primary color during animation

---

## Common Issues & Solutions

### Issue: Aircraft still cuts diagonally
**Solution**: Hard refresh the browser (Ctrl+Shift+R) to clear cache

### Issue: No animation starts
**Solution**: Check console for errors, ensure flight isn't already animating

### Issue: Runway conflict not detected
**Solution**: Verify both flights are using the same runway (08L/TRYA)

### Issue: Animation is jerky
**Solution**: Normal - updates every 200ms, should still follow correct path

---

## Code Verification

### Key Files Changed
1. **src/components/MapView.tsx** (lines 84-141)
   - `getAnimatedPosition` function
   - L-shaped path logic

### Key Files Verified (No Changes)
1. **src/hooks/useFlightAnimation.ts**
   - `isRunwayInUse()` - Already correct
   - `getActiveRunwayFlight()` - Already correct

2. **src/components/tabs/LiveQueueTab.tsx**
   - Runway conflict detection (lines 64-78, 149-160)
   - Audio alerts - Already implemented

---

## Success Metrics

### Path-Following
- ✅ No diagonal shortcuts visible
- ✅ Aircraft stay on yellow centerlines
- ✅ Clear L-shaped paths for both arrivals and departures
- ✅ 90-degree turns at taxiway intersections

### Runway Safety
- ✅ Only one aircraft on runway at a time
- ✅ Conflicts detected and blocked
- ✅ Audio and visual alerts working
- ✅ Sequential clearances work correctly

### User Experience
- ✅ Smooth animations
- ✅ Clear progress indicators
- ✅ Informative toast notifications
- ✅ Realistic ground movement simulation

---

## Next Steps

1. **Test the application** using this guide
2. **Verify all success criteria** are met
3. **Report any issues** with specific flight IDs and phases
4. **Enjoy the improved realism** of the simulation! ✈️

---

## Additional Notes

- The fix maintains all existing functionality
- No breaking changes to the API or data structures
- Performance impact is minimal (same update frequency)
- Compatible with all existing features (emergency flights, monitoring, etc.)

**Development Server**: http://localhost:8080  
**Status**: ✅ Running and ready for testing
