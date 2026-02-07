# Component Architecture

## Current State (Before Integration)

```
App.tsx
  └── Grid.tsx
       ├── Score.tsx
       ├── Square.tsx (x100)
       ├── Legend.tsx
       ├── EditPlayers.tsx
       ├── EditGame.tsx
       └── SummaryModal.tsx
```

## New State (After Phase 1 Integration)

```
App.tsx
  └── Grid.tsx
       ├── CompactHeader.tsx ⭐ NEW
       │    └── Button components (x4)
       │
       ├── WinnerDisplay.tsx ⭐ NEW
       │    ├── Trophy icon
       │    ├── Player name
       │    └── Coordinates
       │
       ├── Score.tsx
       ├── Square.tsx (x100)
       ├── Legend.tsx
       ├── EditPlayers.tsx
       ├── EditGame.tsx
       └── SummaryModal.tsx
```

## Component Props Flow

### CompactHeader
```
Grid.tsx (parent)
  │
  ├─ onShare: () => void
  ├─ onSummary: () => void
  ├─ onShowNext: () => void
  ├─ onUnlock: () => void
  └─ isLocked: boolean
  │
  ▼
CompactHeader.tsx (renders)
```

### WinnerDisplay
```
Grid.tsx (parent)
  │
  ├─ Calculate currentWinner using useMemo
  │   └─ Based on: homeScore, awayScore, grid, players
  │
  ├─ Pass props to WinnerDisplay:
  │   ├─ ownerName: string
  │   ├─ homeDigit: number
  │   ├─ awayDigit: number
  │   ├─ homeTeam: string
  │   └─ awayTeam: string
  │
  ▼
WinnerDisplay.tsx (renders conditionally)
```

## Data Flow Diagram

```
User enters scores
        │
        ▼
Grid.tsx state updates
        │
        ├─────────────┬──────────────┐
        │             │              │
        ▼             ▼              ▼
   Score.tsx    WinnerDisplay   Square.tsx
   (displays)   (calculates &   (highlights
                 shows winner)   if winning)
```

## State Management

### Grid Component State
```typescript
// Existing state
const [grid, dispatch] = useReducer(gridReducer, initialGrid);
const [players, setPlayers] = useState(initialPlayers);
const [homeScore, setHomeScore] = useState(initialHomeScore);
const [awayScore, setAwayScore] = useState(initialAwayScore);
const [isLocked, setIsLocked] = useState(false);

// New computed value (no state needed!)
const currentWinner = useMemo(() => {
  // Calculate from existing state
  return { ownerName, homeDigit, awayDigit };
}, [homeScore, awayScore, grid, players]);
```

## CSS Architecture

```
App.css
  └── Global styles

Grid.css
  └── Grid layout styles
      ├── .Grid (main container)
      ├── .grid-row
      └── .grid-column

CompactHeader.css ⭐ NEW
  └── Header-specific styles
      ├── .compact-header
      ├── .compact-header-title
      ├── .compact-header-actions
      └── .header-btn

WinnerDisplay.css ⭐ NEW
  └── Winner display styles
      ├── .winner-display
      ├── .winner-icon
      ├── .winner-content
      └── Animations (slideIn, bounce)

Score.css
  └── Score display styles

Square.css
  └── Square grid cell styles

Legend.css
  └── Legend/player list styles
```

## File Size Impact

```
Before:
src/colors.ts:          ~3 KB
Total Component Code:   ~15 KB

After Phase 1:
src/colors.ts:          ~4 KB (+1 KB)
New Components:         ~6 KB
Total Component Code:   ~21 KB (+6 KB)

Total Addition:         ~7 KB
```

## Performance Impact

- ✅ No new dependencies
- ✅ Pure CSS animations (GPU accelerated)
- ✅ useMemo for expensive calculations
- ✅ Conditional rendering (winner only shows when needed)
- ✅ No prop drilling (clean component hierarchy)

## Browser Compatibility

All features use:
- Modern CSS (Flexbox, Grid) - IE11+
- React 16+ hooks
- ES6+ features (your build already supports this)
- CSS animations - All modern browsers

## Future Extensions (Phase 2)

```
Grid.tsx
  └── Square.tsx
       └── SquareTooltip.tsx ⭐ PHASE 2
            ├── useScoringScenariosHook
            ├── Scenario calculator
            ├── Probability indicators
            └── Rich hover info
```

## Integration Checklist

- [ ] Import new components in Grid.tsx
- [ ] Add currentWinner calculation
- [ ] Add CompactHeader to JSX
- [ ] Add WinnerDisplay to JSX
- [ ] Wire up button handlers
- [ ] Test in browser
- [ ] Verify responsive behavior
- [ ] Check for console errors

---

**Visual learner?** Check out `design-mockups/design-alternatives.html` to see it rendered!
