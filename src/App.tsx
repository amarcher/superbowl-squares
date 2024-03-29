import React from 'react';
import Grid from './grid';
import { LOCAL_STORAGE_KEY } from './constants';
import { readStateFromUrl, magnify } from './utils';
import './App.css';
import { Toaster } from 'react-hot-toast';

function App() {
  let grid;
  let players;
  let awayScore;
  let homeScore;
  let homeTeam;
  let awayTeam;
  let gameId;

  try {
    ({ grid, awayScore, homeScore, players, homeTeam, awayTeam, gameId } =
      magnify(
        readStateFromUrl() ||
          JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || ''),
      ));
  } catch {
    // do nothing
  }

  return (
    <div className="App">
      <Grid
        initialGridState={grid}
        initialHomeScore={homeScore}
        initialAwayScore={awayScore}
        initialPlayers={players}
        initialHomeTeam={homeTeam}
        initialAwayTeam={awayTeam}
        initialGameId={gameId}
      />
      <Toaster />
    </div>
  );
}

export default App;
