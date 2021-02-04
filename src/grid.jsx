import React, { useReducer, useCallback, useState, useMemo } from "react";
import { getRandomDigits } from "./utils";
import Square from "./square";
import Player from "./player";
import Score from "./score";
import Legend from "./legend";
import EditPlayers from "./editPlayers";
import colors from "./colors";
import "./Grid.css";

const emptySquare = {
  ownerId: undefined,
};

function getEmptySquare(id) {
  return {
    ...emptySquare,
    id: id,
  };
}

const names = ["AMA", "OAS", "KYS", "AYA"];

const initialPlayers = Array(100)
  .fill()
  .map((_, id) => id)
  .reduce(
    (players, playerId) => ({
      ...players,
      [playerId]: getEmptyPlayer(playerId),
    }),
    {}
  );

function getEmptyPlayer(id) {
  return {
    color: colors[id],
    id: id,
    name: names[id],
  };
}

const ids = "0123456789".split("");
const fullIds = ids.reduce(
  (grid, rowNumber) => [
    ...grid,
    ...ids.reduce(
      (row, columnNumber) => [...row, `${rowNumber}${columnNumber}`],
      []
    ),
  ],
  []
);

const initialGrid = fullIds.reduce(
  (grid, id) => ({
    ...grid,
    [id]: getEmptySquare(id),
  }),
  {}
);

function gridReducer(state, { type, payload }) {
  switch (type) {
    case "claim":
      return {
        ...state,
        [payload.id]: {
          ...state[payload.id],
          ownerId: payload.ownerId,
        },
      };
    case "unclaim":
      const currentOwnerId = state[payload.id].ownerId;
      if (currentOwnerId !== payload.ownerId) {
        return state;
      }
      return {
        ...state,
        [payload.id]: {
          ...state[payload.id],
          ownerId: undefined,
        },
      };
    default:
      throw new Error();
  }
}

export default function Grid() {
  const [grid, dispatch] = useReducer(gridReducer, initialGrid);
  const [tbActualScore, setTbActualScore] = useState(0);
  const [kcActualScore, setKcActualScore] = useState(0);
  const [players, setPlayers] = useState(initialPlayers);
  const [activePlayerId, setActivePlayerId] = useState("0");
  const [isLocked, setIsLocked] = useState(false);
  const [tbScore, setTbScore] = useState(Array(10).fill("?"));
  const [kcScore, setKcScore] = useState(Array(10).fill("?"));
  const [isModalOpen, setIsModalOpen] = useState(false);

  const editPlayers = useCallback(() => setIsModalOpen(true), [setIsModalOpen]);
  const closeModal = useCallback(() => setIsModalOpen(false), [setIsModalOpen]);

  const namedPlayers = useMemo(
    () => Object.values(players).filter(({ name }) => !!name),
    [players]
  );

  const claim = useCallback(
    (id) => {
      if (!isLocked) {
        dispatch({
          type: "claim",
          payload: {
            id,
            ownerId: activePlayerId,
          },
        });
      }
    },
    [dispatch, isLocked, activePlayerId]
  );

  const unclaim = useCallback(
    (id) => {
      if (!isLocked) {
        dispatch({
          type: "unclaim",
          payload: {
            id,
            ownerId: activePlayerId,
          },
        });
      }
    },
    [dispatch, isLocked, activePlayerId]
  );

  const lock = useCallback(() => {
    setIsLocked(true);
    setTbScore(getRandomDigits());
    setKcScore(getRandomDigits());
  }, []);

  const setActualScore = useCallback(({ target: { name, value } }) => {
    if (name === "kc-actual-score") {
      setKcActualScore(value);
    } else {
      setTbActualScore(value);
    }
  }, []);

  const unlock = useCallback(() => {
    setIsLocked(false);
    setTbScore(Array(10).fill("?"));
    setKcScore(Array(10).fill("?"));
  }, []);

  const getSquaresOwnedByPlayer = useCallback(
    (ownerId) => {
      return Object.keys(grid).filter((id) => grid[id].ownerId === ownerId);
    },
    [grid]
  );

  return (
    <div className="container">
      <div className="control-container">
        <div className="player-container">
          {namedPlayers.map(({ id, name, color }) => (
            <Player
              key={id}
              id={id}
              isActive={id === activePlayerId}
              name={name}
              color={color}
              ownedSquares={getSquaresOwnedByPlayer(id)}
              setActive={setActivePlayerId}
            />
          ))}
        </div>
        <div className="score-container">
          <input
            onChange={setActualScore}
            value={kcActualScore}
            name="kc-actual-score"
            placeholder="KC"
          />
          <input
            onChange={setActualScore}
            value={tbActualScore}
            name="tb-actual-score"
            placeholder="TB"
          />
        </div>
        <div>
          <button onClick={editPlayers} className="button">
            Players
          </button>
          <button onClick={isLocked ? unlock : lock} className="button">
            {isLocked ? "Unlock" : "Lock"}
          </button>
          <EditPlayers
            isOpen={isModalOpen}
            onClose={closeModal}
            players={players}
            setPlayers={setPlayers}
          />
        </div>
      </div>

      <div className="grid-container">
        <Legend x="TB" y="KC" />
        {tbScore.map((digit, index) => (
          <Score
            key={`tbDigit_${index}`}
            digit={digit}
            color="#AA0000"
            backgroundColor="#B3995D"
          />
        ))}
        {fullIds.map((id) => {
          const { color, name } = players[grid[id].ownerId] || {};
          const square = (
            <Square
              key={id}
              ownerColor={color}
              id={id}
              ownerName={name}
              claim={claim}
              unclaim={unclaim}
              isCurrentWinner={
                isLocked &&
                kcScore[id[0]] ===
                  `${kcActualScore}`.charAt(`${kcActualScore}`.length - 1) &&
                tbScore[id[1]] ===
                  `${tbActualScore}`.charAt(`${tbActualScore}`.length - 1)
              }
            />
          );
          if (id[1] === "0") {
            const digit = kcScore[id[0]];
            const key = `kcDigit_${digit === "?" ? id[0] : digit}`;
            return (
              <React.Fragment key={key}>
                <Score
                  digit={digit}
                  color="#FFB81C"
                  backgroundColor="#E31837"
                />
                {square}
              </React.Fragment>
            );
          }

          return square;
        })}
      </div>
    </div>
  );
}
