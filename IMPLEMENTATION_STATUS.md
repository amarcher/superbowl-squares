# Super Bowl Squares - Design Refresh Implementation

## ✅ Completed Tasks

### Phase 1.1: Color System Update
- ✅ Created new soft player color palette
- ✅ Added `PLAYER_COLORS` with background and text colors
- ✅ Added `AXIS_COLORS` for axis styling
- ✅ Added `WINNER_COLORS` for winner highlighting
- ✅ Added `PROBABILITY_COLORS` for scenario indicators
- ✅ Maintained backward compatibility with legacy color array

### Phase 1.2: New Components Created
- ✅ `WinnerDisplay.tsx` - Shows current winning player
- ✅ `WinnerDisplay.css` - Animated winner card styling
- ✅ `CompactHeader.tsx` - New compact header layout
- ✅ `CompactHeader.css` - Responsive header styling
- ✅ `scenario.ts` - TypeScript interfaces for scoring scenarios

## 🚧 Next Steps

### Integration into Grid Component

The new components need to be integrated into your main `grid.tsx` file. Here's what needs to happen:

#### 1. Import New Components

Add these imports at the top of `grid.tsx`:

```typescript
import WinnerDisplay from './components/WinnerDisplay';
import CompactHeader from './components/CompactHeader';
import { PLAYER_COLORS } from './colors';
```

#### 2. Calculate Current Winner

Add this logic to determine the current winner based on scores:

```typescript
// Inside the Grid component
const currentWinner = useMemo(() => {
  if (!homeScore || !awayScore) return null;
  
  const homeDigit = parseInt(homeScore[homeScore.length - 1]) || 0;
  const awayDigit = parseInt(awayScore[awayScore.length - 1]) || 0;
  
  // Find the square at this intersection
  const squareId = `${homeDigit}${awayDigit}`;
  const square = grid[squareId];
  
  if (!square || !square.ownerId) return null;
  
  const owner = players[square.ownerId];
  
  return {
    ownerName: owner?.name || 'Unclaimed',
    homeDigit,
    awayDigit,
  };
}, [homeScore, awayScore, grid, players]);
```

#### 3. Update JSX Layout

Replace the current layout with this structure:

```typescript
return (
  <div className="grid-container">
    <CompactHeader
      onShare={handleShare}
      onSummary={handleOpenSummary}
      onShowNext={handleToggleNextWinner}
      onUnlock={handleToggleLock}
      isLocked={isLocked}
    />
    
    {currentWinner && (
      <WinnerDisplay
        ownerName={currentWinner.ownerName}
        homeDigit={currentWinner.homeDigit}
        awayDigit={currentWinner.awayDigit}
        homeTeam={homeTeam || 'HOME'}
        awayTeam={awayTeam || 'AWAY'}
      />
    )}
    
    {/* Existing Score component */}
    <Score ... />
    
    {/* Existing Grid squares */}
    {/* ... */}
    
    {/* Existing Legend */}
    <Legend ... />
  </div>
);
```

## 📋 Testing Checklist

After integration, test the following:

- [ ] Header displays correctly with all buttons
- [ ] Winner display shows when scores are entered
- [ ] Winner display updates when scores change
- [ ] Buttons in header trigger correct functions
- [ ] Layout is responsive on mobile
- [ ] Winner animation plays smoothly
- [ ] No console errors

## 🎨 CSS Updates Needed

### Update Grid.css

You'll need to adjust the main grid layout to accommodate the new header:

```css
.grid-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

/* Remove old header styles that conflict */
/* Add spacing for new layout */
```

## 🔜 Next Phase: Tooltip System

Once Phase 1 is integrated and tested, we'll build:
1. `SquareTooltip.tsx` - Rich hover tooltip component
2. `useScoringScenarios.ts` - Hook to calculate scenarios
3. `scoringScenarios.ts` - Scenario calculation logic
4. Enhanced square hover states

## 📝 Notes

- All new components use TypeScript for type safety
- CSS uses modern flexbox/grid layouts
- Animations use CSS for performance
- Components are functional with React hooks
- Backward compatibility maintained with existing code
