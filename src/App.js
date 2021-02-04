import React from "react";
import Grid from "./grid";
import { LOCAL_STORAGE_KEY } from "./constants";
import "./App.css";

function App() {
  let grid = undefined;
  let players = undefined;
  let kcScore = undefined;
  let tbScore = undefined;

  try {
    ({ grid, kcScore, tbScore, players } = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY)
    ));
  } catch {
    // do nothing
  }

  return (
    <div className="App">
      <Grid
        initialGridState={grid}
        initialTbScore={tbScore}
        initialKcScore={kcScore}
        initialPlayers={players}
      />
    </div>
  );
}

export default App;
