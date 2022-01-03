import React from 'react';
import Grid from './grid';
import { LOCAL_STORAGE_KEY } from './constants';
import './App.css';

function App() {
  let grid;
  let players;
  let awayScore;
  let homeScore;

  try {
    ({ grid, awayScore, homeScore, players } = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY)
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
      />
    </div>
  );
}

export default App;
