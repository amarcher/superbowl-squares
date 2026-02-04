# Super Bowl Squares - Design Redesign Notes

**Date:** February 3, 2026
**Goal:** Reimagine the Super Bowl Squares interface with modern, minimal design principles

## Context
This is a Super Bowl Squares pool application where:
- 10x10 grid (100 squares) with players claiming squares
- Numbers 0-9 are randomly assigned to rows (NFC) and columns (AFC)
- Winners are determined by the last digit of each team's score at the end of quarters
- The intersection of those two digits determines the winning square

## Current Issues Identified
1. Hard to quickly see who owns which squares - names blend into colored backgrounds
2. Score display (0-0) is too small given it's the key mechanism for determining winners
3. No clear indication of which square is currently winning
4. Missing context: which quarter? What's the payout structure?
5. Row/column numbers not prominent enough - they're the whole game!
6. "Auto-update" checkbox is small and easy to miss
7. Can't easily see square distribution - who has the most squares?

## Design Direction Chosen
**Minimal & Clean (Design #3 approach)** with the following characteristics:

### Color Palette
- **Player Square Colors:** Soft, muted tones from Design #3
  - Clint: `#86efac` (soft green)
  - Mike: `#fca5a5` (soft red)
  - Andy: `#a5b4fc` (soft blue)
  - Matt: `#67e8f9` (soft cyan)
  - James: `#fde047` (soft yellow)
  
- **NFL Team Colors:** Keep the existing NFL team colors for highlighting the axis numbers that represent the last digits of scores

### Key Features
1. **Clean Score Display**
   - Horizontal layout with clear team labels
   - Large score numbers
   - Highlighted last digits in distinctive style
   - Quarter indicator with game time

2. **Prominent Grid Numbers**
   - Bold, dark background for 0-9 axis labels
   - Numbers on all four sides for easy reference
   - High contrast for readability

3. **Winning Square Highlight**
   - Golden/yellow highlight for current winning square
   - Subtle animation/glow effect

4. **Bottom Legend**
   - Show all players with their colors
   - Display square counts
   - Simple, horizontal layout

5. **Minimal Controls**
   - Button hierarchy (primary vs secondary)
   - Clean, modern button styling

## Technical Implementation Plan

### Files to Update
1. **colors.ts** - Update player color palette to new muted tones
2. **Score.css / score.tsx** - Redesign score display component
3. **Grid.css / grid.tsx** - Update grid styling with new minimal approach
4. **Square.css / square.tsx** - Update square styling
5. **Legend.css / legend.tsx** - Redesign legend component
6. **App.css** - Overall layout updates

### Design Tokens to Add
```typescript
// Soft player colors
export const PLAYER_COLORS = {
  clint: '#86efac',
  mike: '#fca5a5', 
  andy: '#a5b4fc',
  matt: '#67e8f9',
  james: '#fde047'
};

// Dark text for readability on light backgrounds
export const PLAYER_TEXT_COLORS = {
  clint: '#166534',
  mike: '#991b1b',
  andy: '#3730a3', 
  matt: '#164e63',
  james: '#854d0e'
};

// Axis styling
export const AXIS_BG = '#111827';
export const AXIS_TEXT = '#ffffff';

// Winning square highlight
export const WINNER_HIGHLIGHT = '#fbbf24';
export const WINNER_BG = '#fef3c7';
```

## Next Steps
1. Update color constants
2. Redesign score component with larger, clearer display
3. Update grid styling with new minimal aesthetic
4. Implement winning square highlighting
5. Redesign legend/player list
6. Update button styles
7. Test responsive behavior

## Design Principles
- **Clarity over decoration:** Every element serves a purpose
- **Hierarchy:** Score and winning square are primary, everything else is supporting
- **Readability:** High contrast, appropriate font sizes
- **Minimal formatting:** Clean lines, ample whitespace
- **Accessibility:** Consider color blindness, screen readers
