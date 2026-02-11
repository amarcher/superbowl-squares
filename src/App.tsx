import React, { useEffect, useState } from 'react';
import Grid from './grid';
import { LOCAL_STORAGE_KEY } from './constants';
import { readStateFromUrl, magnify, decodeObject } from './utils';
import { resolveShortCode } from './linkShortener';
import './App.css';
import { Toaster } from 'react-hot-toast';
import type AppState from './types/appState';
import type SlimAppState from './types/slimAppState';

function extractShortCode(): string | null {
  const match = window.location.pathname.match(/\/s\/([A-Za-z0-9]{8})\/?$/);
  return match ? match[1] : null;
}

function App() {
  const shortCode = extractShortCode();
  const [loading, setLoading] = useState(!!shortCode);
  const [appState, setAppState] = useState<{
    grid?: AppState['grid'];
    players?: AppState['players'];
    awayScore?: AppState['awayScore'];
    homeScore?: AppState['homeScore'];
    homeTeam?: AppState['homeTeam'];
    awayTeam?: AppState['awayTeam'];
    gameId?: AppState['gameId'];
  }>(() => {
    if (shortCode) return {};
    try {
      return magnify(
        readStateFromUrl() ||
          JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || ''),
      );
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (!shortCode) return;

    resolveShortCode(shortCode).then((encodedState) => {
      if (encodedState) {
        try {
          const slimState = decodeObject(encodedState) as SlimAppState;
          const fullState = magnify(slimState);
          // Replace URL so writeStateToUrl() in grid.tsx continues to work
          window.history.replaceState(null, '', `/#${encodedState}`);
          setAppState(fullState);
        } catch (err) {
          console.error('Failed to decode short link state:', err);
        }
      }
      setLoading(false);
    });
  }, [shortCode]);

  if (loading) {
    return (
      <div className="App" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p style={{ color: '#fff', fontSize: '1.2rem' }}>Loading game...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <Grid
        initialGridState={appState.grid}
        initialHomeScore={appState.homeScore}
        initialAwayScore={appState.awayScore}
        initialPlayers={appState.players}
        initialHomeTeam={appState.homeTeam}
        initialAwayTeam={appState.awayTeam}
        initialGameId={appState.gameId}
      />
      <Toaster />
    </div>
  );
}

export default App;
