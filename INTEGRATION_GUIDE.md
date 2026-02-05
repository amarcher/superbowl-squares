# Step-by-Step Integration Guide

## Overview
This guide will walk you through integrating the new components into your existing code.

## Step 1: Verify New Files

Make sure these files exist:
- ✅ `src/colors.ts` (updated)
- ✅ `src/types/scenario.ts`
- ✅ `src/components/WinnerDisplay.tsx`
- ✅ `src/components/WinnerDisplay.css`
- ✅ `src/components/CompactHeader.tsx`
- ✅ `src/components/CompactHeader.css`

## Step 2: Update grid.tsx Imports

Open `src/grid.tsx` and add these imports after your existing imports:

```typescript
import WinnerDisplay from './components/WinnerDisplay';
import CompactHeader from './components/CompactHeader';
import { PLAYER_COLORS } from './colors';
```

## Step 3: Add Winner Calculation Logic

Inside your `Grid` component function, after your existing `useMemo` and `useEffect` hooks, add:

```typescript
// Calculate current winner based on last digits of scores
const currentWinner = useMemo(() => {
  // Parse last digits from score arrays
  const homeLastDigit = homeScore.find(d => d !== '?');
  const awayLastDigit = awayScore.find(d => d !== '?');
  
  if (!homeLastDigit || !awayLastDigit) return null;
  
  const homeDigit = parseInt(homeLastDigit);
  const awayDigit = parseInt(awayLastDigit);
  
  // Find which square corresponds to these digits
  const squareKey = Object.keys(grid).find(key => {
    const square = grid[key];
    return square.awayNum === awayDigit && square.homeNum === homeDigit;
  });
  
  if (!squareKey) return null;
  
  const square = grid[squareKey];
  const ownerId = square.ownerId;
  
  if (ownerId === undefined) {
    return {
      ownerName: 'Unclaimed',
      homeDigit,
      awayDigit,
    };
  }
  
  const owner = players[ownerId];
  
  return {
    ownerName: owner?.name || 'Unknown',
    homeDigit,
    awayDigit,
  };
}, [homeScore, awayScore, grid, players]);
```

## Step 4: Find Your Existing Button Handlers

Look for these existing functions in your `grid.tsx`:
- Share button handler
- Summary button handler  
- Show/Hide next handler
- Lock/Unlock handler

Note: If these don't exist yet, we'll create simple versions.

## Step 5: Update the JSX Return Statement

Find your component's `return` statement. It probably looks something like:

```typescript
return (
  <div className="Grid">
    {/* existing content */}
  </div>
);
```

Replace it with this structure:

```typescript
return (
  <div className="Grid">
    <CompactHeader
      onShare={() => {/* your share logic */}}
      onSummary={() => {/* your summary logic */}}
      onShowNext={() => setIsLocked(!isLocked)}
      onUnlock={() => setIsLocked(!isLocked)}
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
    
    {/* Keep all your existing JSX below this */}
    <Score ... />
    {/* rest of your existing code */}
  </div>
);
```

## Step 6: Test the Application

Run your development server:
```bash
npm start
```

Visit http://localhost:3000 and verify:
1. New header appears at top
2. Winner display shows when you have scores
3. Buttons work correctly
4. No console errors

## Step 7: Update Square Colors (Optional but Recommended)

To use the new soft player colors, find where you're setting square background colors.

Look for something like:
```typescript
<div style={{ backgroundColor: colors[ownerId] }}>
```

Replace with:
```typescript
<div style={{ 
  backgroundColor: PLAYER_COLORS[ownerId]?.bg || colors[ownerId],
  color: PLAYER_COLORS[ownerId]?.text || '#000'
}}>
```

## Troubleshooting

### Issue: "Cannot find module './components/WinnerDisplay'"
**Solution**: Make sure the `components` folder exists in `src/` and the files are there.

### Issue: "currentWinner is null"
**Solution**: Make sure you have scores entered. The winner only shows when both teams have scores.

### Issue: Layout looks broken
**Solution**: Check that Grid.css doesn't have conflicting styles. You may need to adjust padding/margins.

### Issue: Buttons don't do anything
**Solution**: Make sure you're passing the correct handler functions to CompactHeader props.

## Next Steps

Once this is working:
1. We'll add the tooltip system
2. Implement scoring scenarios
3. Add probability indicators
4. Polish animations and interactions

## Need Help?

If you get stuck:
1. Check browser console for errors
2. Verify all imports are correct
3. Make sure TypeScript isn't showing any errors
4. Check that component props match the interfaces
