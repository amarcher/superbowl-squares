# Phase 1 Implementation Plan

## Files to Create/Modify

### New Files
1. `src/components/WinnerDisplay.tsx` - Current winner card component
2. `src/components/SquareTooltip.tsx` - Rich hover tooltip
3. `src/components/CompactHeader.tsx` - New compact header layout
4. `src/hooks/useScoringScenarios.ts` - Calculate winning scenarios
5. `src/utils/scoringScenarios.ts` - Logic for scenario generation
6. `src/types/scenario.ts` - TypeScript types for scenarios

### Files to Modify
1. `src/App.css` - Update for new layout
2. `src/Grid.css` - Enhance grid styling
3. `src/grid.tsx` - Integrate new components
4. `src/Square.css` - Add hover states
5. `src/square.tsx` - Add tooltip trigger
6. `src/colors.ts` - Add new color palette

## Phase 1 Tasks (Space & Layout)

### Task 1.1: Update Color System
- Add soft player colors
- Define winner highlight colors
- Update axis colors

### Task 1.2: Create Compact Header
- Move buttons to top-right
- Add clean title
- Responsive layout

### Task 1.3: Create Winner Display Component
- Show current winner
- Display square coordinates
- Animated entry

### Task 1.4: Optimize Grid Layout
- Increase grid size
- Better spacing
- Remove excess padding

### Task 1.5: Update App Layout
- Integrate new header
- Add winner display
- Test responsive behavior

## Development Order

1. ✅ Color system update
2. ⬜ Winner Display component
3. ⬜ Compact Header component  
4. ⬜ Grid layout optimization
5. ⬜ Integration & testing

Let's start!
