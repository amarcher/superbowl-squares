import React, {
  useReducer,
  useCallback,
  useState,
  useMemo,
  useEffect,
} from 'react';
import { useUpdateScores } from './hooks';
import { getRandomDigits, shuffle } from './utils';
import { /* allNextScores, */ scoreToOwnerKey } from './future-utils';
import Square from './square';
import Player from './player';
import Score from './score';
import Legend from './legend';
import EditPlayers from './editPlayers';
import EditGame from './editGame';
import colors from './colors';
import { LOCAL_STORAGE_KEY } from './constants';
import './Grid.css';

const emptySquare = {
  ownerId: undefined,
};

const PERIOD = ['', '1st', '2nd', '3rd', '4th'];

function getEmptySquare(id) {
  return {
    ...emptySquare,
    id: id,
  };
}

const names = ['ENTER', 'PLAYERS’', 'INITIALS'];

const presetPlayers = Array(100)
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

const ids = '0123456789'.split('');
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

function randomizeGridForOwnerIds(ownerIds) {
  return shuffle(fullIds).reduce(
    (grid, id, index) => ({
      ...grid,
      [id]: {
        id,
        ownerId: ownerIds[index % ownerIds.length],
      },
    }),
    {}
  );
}

function gridReducer(state, { type, payload }) {
  switch (type) {
    case 'claim':
      return {
        ...state,
        [payload.id]: {
          ...state[payload.id],
          ownerId: payload.ownerId,
        },
      };
    case 'unclaim':
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
    case 'auto-pick':
      const { ownerIds } = payload;
      return randomizeGridForOwnerIds(ownerIds);
    default:
      throw new Error();
  }
}

export default function Grid({
  initialGridState,
  initialPlayers,
  initialAwayScore,
  initialHomeScore,
  initialHomeTeam,
  initialAwayTeam,
  initialGameId,
}) {
  const [grid, dispatch] = useReducer(
    gridReducer,
    initialGridState || initialGrid
  );
  const [homeActualScore, setHomeActualScore] = useState(0);
  const [awayActualScore, setAwayActualScore] = useState(0);
  const [players, setPlayers] = useState(initialPlayers || presetPlayers);
  const [gameId, setGameId] = useState(initialGameId);
  const [homeTeam, setHomeTeam] = useState(initialHomeTeam || 'HOME');
  const [awayTeam, setAwayTeam] = useState(initialAwayTeam || 'AWAY');
  const [activePlayerId, setActivePlayerId] = useState(0);
  const [isLocked, setIsLocked] = useState(!!initialPlayers);
  const [homeScore, setHomeScore] = useState(
    initialHomeScore || Array(10).fill('?')
  );
  const [awayScore, setAwayScore] = useState(
    initialAwayScore || Array(10).fill('?')
  );
  const [isEditPlayersModalOpen, setIsEditPlayersModalOpen] = useState(false);
  const [isEditGameModalOpen, setIsEditGameModalOpen] = useState(false);
  const [isAutoUpdating, setIsAutoUpdating] = useState(isLocked);

  const { clock, period, games } = useUpdateScores(
    isAutoUpdating,
    setHomeActualScore,
    setAwayActualScore,
    homeTeam,
    awayTeam,
    gameId,
    setGameId,
    setHomeTeam,
    setAwayTeam
  );

  const editPlayers = useCallback(() => setIsEditPlayersModalOpen(true), []);
  const editGame = useCallback(() => setIsEditGameModalOpen(true), []);
  const closeEditPlayersModal = useCallback(
    () => setIsEditPlayersModalOpen(false),
    []
  );
  const closeEditGameModal = useCallback(
    () => setIsEditGameModalOpen(false),
    []
  );

  const namedPlayers = useMemo(
    () => Object.values(players).filter(({ name }) => !!name),
    [players]
  );

  const claim = useCallback(
    (id) => {
      if (!isLocked) {
        dispatch({
          type: 'claim',
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
          type: 'unclaim',
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
    setHomeScore(getRandomDigits());
    setAwayScore(getRandomDigits());
    setIsLocked(true);
    setIsAutoUpdating(true);
  }, []);

  useEffect(() => {
    if (isLocked && window.localStorage) {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          homeScore,
          awayScore,
          grid,
          players,
          homeTeam,
          awayTeam,
          gameId,
        })
      );
    }
  }, [
    grid,
    isLocked,
    awayScore,
    players,
    homeScore,
    homeTeam,
    awayTeam,
    gameId,
  ]);

  useEffect(() => {
    if (!isLocked && window.localStorage) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [isLocked]);

  const setActualScore = useCallback(({ target: { name, value } }) => {
    if (name === 'away-actual-score') {
      setAwayActualScore(value);
    } else {
      setHomeActualScore(value);
    }
  }, []);

  const unlock = useCallback(() => {
    setIsLocked(false);
    setIsAutoUpdating(false);
    setHomeScore(Array(10).fill('?'));
    setAwayScore(Array(10).fill('?'));
  }, []);

  const toggleIsAutoUpdating = useCallback(() => {
    setIsAutoUpdating((wasAutoUpdating) => !wasAutoUpdating);
  }, []);

  const getSquaresOwnedByPlayer = useCallback(
    (ownerId) => {
      return Object.keys(grid).filter((id) => grid[id].ownerId === ownerId);
    },
    [grid]
  );

  const scoreToOwnerIdMap = React.useMemo(() => {
    const updatedScoreToOwnerIdMap = Object.keys(grid).reduce((map, id) => {
      const square = grid[id];

      if (square.ownerId !== undefined) {
        const homeScoreIndex = id[1];
        const awayScoreIndex = id[0];
        const scoreKey = scoreToOwnerKey(
          homeScore[homeScoreIndex],
          awayScore[awayScoreIndex]
        );
        map[scoreKey] = square.ownerId;
      }

      return map;
    }, {});

    return updatedScoreToOwnerIdMap;
  }, [awayScore, grid, homeScore]);

  /**
   * @param {number} homeScore
   * @param {number} awayScore
   */
  function scoreToOwner(homeScore, awayScore) {
    return players[scoreToOwnerIdMap[scoreToOwnerKey(homeScore, awayScore)]];
  }

  const autoPick = useCallback(() => {
    dispatch({
      type: 'auto-pick',
      payload: {
        ownerIds: Object.values(namedPlayers).map((player) => player.id),
      },
    });
  }, [namedPlayers]);

  return (
    <div className="container">
      <div className="control-container">
        <div className="player-container">
          {namedPlayers.map(({ id, name, color }) => (
            <Player
              key={id}
              id={id}
              isActive={!isLocked && id === activePlayerId}
              name={name}
              color={color}
              ownedSquares={getSquaresOwnedByPlayer(id)}
              setActive={setActivePlayerId}
            />
          ))}
        </div>
        <div>
          <button onClick={editPlayers} className="button">
            Players
          </button>
          {!isLocked && (
            <>
              <button onClick={autoPick} className="button">
                Auto-Pick
              </button>
              <button onClick={editGame} className="button">
                Game
              </button>
            </>
          )}
          <button onClick={isLocked ? unlock : lock} className="button">
            {isLocked ? 'Unlock' : 'Lock'}
          </button>
          <EditPlayers
            isOpen={isEditPlayersModalOpen}
            onClose={closeEditPlayersModal}
            players={players}
            setPlayers={setPlayers}
          />
          <EditGame
            isOpen={isEditGameModalOpen}
            onClose={closeEditGameModal}
            gameId={gameId}
            setGameId={setGameId}
            games={games}
          />
        </div>
      </div>

      <div className="score-container">
        <label className="score-label">
          {awayTeam}
          <input
            onChange={setActualScore}
            value={awayActualScore}
            name="away-actual-score"
            placeholder={awayTeam}
            className={`score-input ${awayTeam?.toLowerCase()}`}
            type="number"
            min="0"
            disabled={isAutoUpdating}
          />
        </label>
        <div className="score-divider">-</div>
        <label className="score-label">
          {homeTeam}
          <input
            onChange={setActualScore}
            value={homeActualScore}
            name="home-actual-score"
            placeholder={homeTeam}
            className={`score-input ${homeTeam?.toLowerCase()}`}
            type="number"
            min="0"
            disabled={isAutoUpdating}
          />
        </label>
      </div>

      <div className="time">
        <div className="clock">{clock}</div>
        <div className="period">{PERIOD[period] || ''}</div>
      </div>

      <div>
        <label className="refresh-control">
          <input
            type="checkbox"
            checked={isAutoUpdating}
            onChange={toggleIsAutoUpdating}
          />{' '}
          Auto-update
        </label>
      </div>

      <div className={`grid-container${isLocked ? ' locked' : ''}`}>
        <Legend x={homeTeam} y={awayTeam} />
        {homeScore.map((digit, index) => (
          <Score
            key={`homeDigit_${index}`}
            digit={digit}
            className={homeTeam?.toLowerCase()}
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
                awayScore[id[0]] ===
                  `${awayActualScore}`.charAt(
                    `${awayActualScore}`.length - 1
                  ) &&
                homeScore[id[1]] ===
                  `${homeActualScore}`.charAt(`${homeActualScore}`.length - 1)
              }
            />
          );
          if (id[1] === '0') {
            const digit = awayScore[id[0]];
            const key = `awayDigit_${digit === '?' ? id[0] : digit}`;
            return (
              <React.Fragment key={key}>
                <Score digit={digit} className={awayTeam?.toLowerCase()} />
                {square}
              </React.Fragment>
            );
          }

          return square;
        })}
      </div>
      {/* Put below in a modal! */}
      {/* <h2>In one score...</h2>
      {allNextScores(homeActualScore, awayActualScore).map((nextScore, idx) => {
        const ownerName = scoreToOwner(nextScore.home, nextScore.away)?.name;

        if (!ownerName) {
          return null;
        }

        return (
          <div key={idx}>
            If {nextScore.scorer} scores a {nextScore.type}: {ownerName} is in
            the lead! ({nextScore.away}-{nextScore.home})
          </div>
        );
      })} */}
    </div>
  );
}
