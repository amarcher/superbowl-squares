# Implementation Guide: Minimal Design with NFL Team Colors

## Overview
This guide shows how to integrate the NFL team colors from your current implementation into the new minimal design (Design #3 from the mockups).

## Color Strategy

### Player Square Colors (Soft/Muted)
Keep the soft, pastel colors for the player-owned squares:
- Clint: `#86efac` (soft green) with text `#166534`
- Mike: `#fca5a5` (soft red) with text `#991b1b`
- Andy: `#a5b4fc` (soft blue) with text `#3730a3`
- Matt: `#67e8f9` (soft cyan) with text `#164e63`
- James: `#fde047` (soft yellow) with text `#854d0e`

### NFL Team Colors for Axis Numbers
Use your existing `gradients.ts` system for the axis number cells that represent the last digits. The axis numbers should:
1. Use the dark background (`#111827`) with white text as the default
2. When the score updates and a number becomes a "last digit", apply the NFL team gradient to that specific axis cell
3. This creates a visual connection: "This number is in play!"

## Implementation Steps

### 1. Update `colors.ts`
```typescript
// New soft player colors
export const PLAYER_COLORS = {
  clint: { bg: '#86efac', text: '#166534' },
  mike: { bg: '#fca5a5', text: '#991b1b' },
  andy: { bg: '#a5b4fc', text: '#3730a3' },
  matt: { bg: '#67e8f9', text: '#164e63' },
  james: { bg: '#fde047', text: '#854d0e' }
};

// Axis styling
export const AXIS_COLORS = {
  default: { bg: '#111827', text: '#ffffff' },
  active: null // Will use gradient from gradients.ts
};

// Winning square highlight
export const WINNER_COLORS = {
  bg: '#fef3c7',
  border: '#fbbf24'
};

// Keep your existing colors array for backward compatibility
const colors = [
  // ... existing colors
];

export default colors;
```

### 2. Update Grid Component Logic
The grid should now handle two visual states for axis numbers:

```typescript
// Pseudocode for axis number rendering
function AxisNumberCell({ number, isActive, teamGradient }) {
  const style = isActive 
    ? { background: teamGradient, color: '#fff' }
    : { background: '#111827', color: '#fff' };
  
  return <div style={style}>{number}</div>;
}
```

### 3. Score Display Enhancement
When scores update:
1. Extract last digits
2. Highlight those axis cells with team gradients
3. Highlight the winning square with golden border

```typescript
// Example logic
const nfcLastDigit = nfcScore % 10;
const afcLastDigit = afcScore % 10;

// These digits get the NFL gradient applied
const activeNfcAxis = nfcLastDigit;
const activeAfcAxis = afcLastDigit;
```

### 4. CSS Classes to Add

```css
/* Soft player colors */
.square-clint {
  background-color: #86efac;
  color: #166534;
}

.square-mike {
  background-color: #fca5a5;
  color: #991b1b;
}

.square-andy {
  background-color: #a5b4fc;
  color: #3730a3;
}

.square-matt {
  background-color: #67e8f9;
  color: #164e63;
}

.square-james {
  background-color: #fde047;
  color: #854d0e;
}

/* Axis cells */
.axis-cell {
  background: #111827;
  color: white;
  font-weight: 700;
  font-size: 16px;
}

.axis-cell.active {
  /* Gradient will be applied via inline style */
  color: white;
  box-shadow: 0 0 0 2px #fbbf24;
}

/* Winning square */
.square.winner {
  background: #fef3c7;
  border: 2px solid #fbbf24;
  box-shadow: inset 0 0 0 2px #fbbf24;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.9; }
}

/* Grid layout */
.grid-container {
  display: grid;
  grid-template-columns: repeat(11, 1fr);
  grid-template-rows: repeat(11, 1fr);
  gap: 0;
  border: 2px solid #111827;
  max-width: 700px;
  margin: 0 auto;
}

.grid-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid #e5e7eb;
  background: white;
  transition: all 0.15s;
  cursor: pointer;
}

.grid-cell:hover {
  background: #f9fafb;
  border-color: #111827;
  transform: scale(1.02);
}
```

## Visual Hierarchy Example

Here's how it looks in practice:

```
Score: NFC 24 - AFC 17
Last digits: 4 (NFC) and 7 (AFC)

GRID:
- Top row (AFC): Number "7" has gradient applied
- Left column (NFC): Number "4" has gradient applied  
- Square at intersection (4,7): Has golden winner border
- All player squares: Soft pastel colors
- Other axis numbers: Dark background, white text
```

## Migration Checklist

- [ ] Update `colors.ts` with new player color scheme
- [ ] Modify grid component to handle active axis states
- [ ] Update score component to calculate and pass last digits
- [ ] Add CSS classes for new color scheme
- [ ] Update Square component to use new player colors
- [ ] Add winner highlighting logic
- [ ] Test with different score combinations
- [ ] Ensure gradients display correctly on axis cells
- [ ] Update legend/player list with new colors
- [ ] Test hover states and interactions

## Notes
- Keep your existing `gradients.ts` file - it's perfect for the NFL team colors
- The soft player colors improve readability and create better contrast
- The gradient highlighting on axis numbers creates a clear visual connection between score and grid
- The golden winner highlight is unmistakable and celebratory
