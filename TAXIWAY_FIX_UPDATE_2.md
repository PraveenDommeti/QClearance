# Taxiway Path Fix - Update 2

## Changes Made (2026-02-14 22:09)

### ✅ Issue 1: Removed Runway B
**Problem**: Two runways (TRYA and TRYB) were visible on the map, but only one should be used.

**Solution**:
- ✅ Removed `runwayB` definition completely
- ✅ Removed all Runway B SVG rendering code
- ✅ Updated runway end markers to show only 08L/26R
- ✅ Renamed runway from "TRYA" to "08L/26R" for clarity

### ✅ Issue 2: Added Vertical Taxiway (TWY A)
**Problem**: Aircraft were still cutting diagonally because there was no vertical taxiway line for them to follow.

**Solution**:
- ✅ Added TWY A as a vertical taxiway line (X=170, Y=80 to Y=320)
- ✅ Kept cross taxiways (horizontal connections from terminal)
- ✅ Added runway access taxiway (horizontal connection from TWY A to runway)

---

## New Taxiway Layout

```
Terminal                    Runway 08L/26R
┌──────┐                    ║
│ A01  │────────┐           ║
│      │        │           ║
│ A02  │────────┤           ║
│      │        │           ║
│ B02  │────────┼───TWY A───║
│      │        │    ║      ║
│ C01  │────────┤    ║      ║
│      │        │    ║      ║
│ C02  │────────┤    ║      ║
│      │        │    ║      ║
│ D01  │────────┘    ║      ║
└──────┘             ║      ║
                     ║      ║
         Cross       ║   Runway
       Taxiways    (Vertical) (Vertical)
```

### Taxiway Components:
1. **TWY A (Vertical)**: Main north-south taxiway at X=170
2. **Cross Taxiways (Horizontal)**: Three connections from terminal to TWY A
   - Upper: Y=120
   - Middle: Y=200 (main)
   - Lower: Y=280
3. **Runway Access**: Short horizontal connection from TWY A to runway

---

## Expected Aircraft Paths

### Departure (Gate → Runway)
```
Step 1: Gate (50, varies) → Horizontal → TWY A (170, varies)
Step 2: TWY A (170, varies) → Vertical → Cross Taxiway (170, 200)
Step 3: Cross Taxiway (170, 200) → Horizontal → Runway (180, 200)
Step 4: Runway entry (180, 200) → Vertical → Threshold (180, 320)
Step 5: Takeoff roll
```

### Arrival (Runway → Gate)
```
Step 1: Landing and rollout to cross taxiway
Step 2: Cross Taxiway (180, 200) → Horizontal → TWY A (170, 200)
Step 3: TWY A (170, 200) → Vertical → Gate level (170, varies)
Step 4: Gate level (170, varies) → Horizontal → Gate (50, varies)
```

---

## Code Changes Summary

### File: `src/components/MapView.tsx`

#### 1. Runway Definition (Lines 43-49)
```typescript
// BEFORE: Two runways
const runwayA = { name: "TRYA", x: 180, ... };
const runwayB = { name: "TRYB", x: 250, ... };

// AFTER: Single runway
const runwayA = { name: "08L/26R", x: 180, ... };
// runwayB removed
```

#### 2. Taxiway Layout (Lines 51-63)
```typescript
// BEFORE: Only horizontal taxiways
const taxiways = [
    { x1: 80, y1: 120, x2: 170, y2: 120 },
    { x1: 80, y1: 200, x2: 170, y2: 200 },
    { x1: 80, y1: 280, x2: 170, y2: 280 },
];

// AFTER: Vertical TWY A + horizontal cross taxiways
const taxiways = [
    // TWY A - Vertical taxiway
    { x1: 170, y1: 80, x2: 170, y2: 320 },
    
    // Cross taxiways - Horizontal
    { x1: 80, y1: 120, x2: 170, y2: 120 },
    { x1: 80, y1: 200, x2: 170, y2: 200 },
    { x1: 80, y1: 280, x2: 170, y2: 280 },
    
    // Runway access
    { x1: 170, y1: 200, x2: 180, y2: 200 },
];
```

#### 3. SVG Rendering (Lines 316-395)
```typescript
// BEFORE: Runway A and Runway B rendered
<g>{/* Runway A */}</g>
<g>{/* Runway B */}</g>

// AFTER: Only Runway A rendered
<g>{/* Runway A (08L/26R) */}</g>
// Runway B section completely removed
```

#### 4. Runway End Markers (Lines 351-365)
```typescript
// BEFORE: Two runway markers (26R and 26L)
<text>26R</text>  // Runway A
<text>26L</text>  // Runway B

// AFTER: Single runway markers (08L and 26R)
<text>08L</text>  // North end
<text>26R</text>  // South end
```

---

## Visual Result

### Before Fix:
- ❌ Two runways visible (TRYA and TRYB)
- ❌ Aircraft cutting diagonally
- ❌ No visible vertical taxiway

### After Fix:
- ✅ Single runway (08L/26R)
- ✅ Vertical TWY A visible on map
- ✅ Aircraft should follow L-shaped paths along taxiway lines
- ✅ Clear taxiway infrastructure

---

## Testing Instructions

1. **Open the application**: http://localhost:8080
2. **Check the map view**:
   - ✅ Should see only ONE runway (on the right)
   - ✅ Should see vertical yellow line (TWY A) at X=170
   - ✅ Should see horizontal yellow lines (cross taxiways)

3. **Approve a departure**:
   - Aircraft should move horizontally from gate to TWY A
   - Then vertically along TWY A to cross taxiway
   - Then horizontally to runway
   - Should follow yellow taxiway lines

4. **Approve an arrival**:
   - Aircraft should exit runway to cross taxiway
   - Then vertically along TWY A
   - Then horizontally to gate
   - Should follow yellow taxiway lines

---

## Key Coordinates

| Element | X Position | Y Range | Description |
|---------|-----------|---------|-------------|
| Terminal Gates | 50 | 100-300 | Aircraft parking positions |
| Cross Taxiways | 80-170 | 120, 200, 280 | Horizontal connections |
| TWY A (Vertical) | 170 | 80-320 | Main north-south taxiway |
| Runway Access | 170-180 | 200 | Connection to runway |
| Runway 08L/26R | 180 | 40-360 | Single active runway |

---

## Status

✅ **Runway B Removed**: No longer visible on map  
✅ **Vertical TWY A Added**: Visible as yellow dashed line  
✅ **Path Logic Updated**: Aircraft use L-shaped paths  
✅ **HMR Applied**: Changes live in browser  

**Next**: Test in browser to verify aircraft follow the new taxiway layout correctly.
