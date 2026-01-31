# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm start       # Run dev server at http://localhost:3000
npm test        # Run tests in interactive watch mode
npm run build   # Build production bundle to /build
```

### Node Version
The project requires Node.js version `^18.19.0` (see package.json engines field).

## Architecture

### State Management
This is a React application for managing Super Bowl squares games. The core architecture centers around URL-based state persistence and dual state representations:

**State Persistence Strategy:**
- State is encoded in the URL hash using base64url encoding (via `universal-base64url`)
- State is also stored in localStorage under key `_superbowl-squares_`
- On app initialization (App.tsx:17-22), state is read from URL hash first, falling back to localStorage
- Two state formats exist: `AppState` (expanded) and `SlimAppState` (compressed for URL)
  - `minify()` converts AppState → SlimAppState for URL storage
  - `magnify()` converts SlimAppState → AppState for app usage

**Main State Shape (AppState):**
- `grid: Record<string, Square>` - 100 squares (10x10 grid), keyed by ID like "00", "01", ..., "99"
- `players: Record<string, Player>` - Up to 100 players with colors, names, IDs
- `homeScore: string[]` / `awayScore: string[]` - Arrays of 10 digits (0-9) in random order
- `homeTeam: string` / `awayTeam: string` - Team abbreviations (e.g., "SF", "BAL")
- `gameId?: string` - ESPN game ID for live score updates

**Grid Component (src/grid.tsx):**
The main component managing all game state via React hooks:
- Uses `useReducer` for grid square ownership (claim/unclaim/auto-pick actions)
- Manages players, scores, teams, and game configuration
- Handles score randomization with `getRandomDigits()` which shuffles 0-9
- Integrates live score updates via `useUpdateScores` hook

### Live Score Integration
The `useUpdateScores` hook (src/hooks.tsx) polls ESPN's API every 30 seconds:
- Endpoint: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard`
- Fetches all NFL games and matches by `gameId` or defaults to first game
- Updates game clock, period, team names, and scores in real-time

### Link Shortening
The app uses short.io API (src/linkShortener.ts) to create shareable links:
- Domain: `go.superbowl-squares.com`
- Shortens the full URL with encoded game state
- Public API key is hardcoded (intentionally public for client-side use)

### Color System
Player colors are managed in two places:
- `src/colors.ts` - Static color palette for players
- `src/gradients.ts` - CSS gradient definitions for visual effects

### Key Utilities (src/utils.ts)
- `getRandomDigits()` - Fisher-Yates shuffle for score digits
- `randomizeGridForOwnerIds()` - Auto-assigns squares to players
- `INITIAL_GRID` / `EMPTY_PLAYERS` / `PRESET_PLAYERS` - Default state constants
- URL encoding/decoding functions for state persistence

### Component Structure
- `Grid` - Main container managing all state
- `Square` - Individual grid cell, clickable to claim/unclaim
- `Player` - Player selector UI
- `Score` - Displays and manages score randomization
- `Legend` - Shows current winners based on score combinations
- `EditPlayers` / `EditGame` - Modal dialogs for configuration
- `SummaryModal` - Shows link sharing and game summary

### Testing
Tests use React Testing Library. The project has minimal test coverage currently (only App.test.tsx exists).
