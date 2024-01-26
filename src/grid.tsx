import React, {
  useReducer,
  useCallback,
  useState,
  useMemo,
  useEffect,
} from 'react';
import { useUpdateScores } from './hooks';
import { getRandomDigits, shuffle } from './utils';
import { allNextScores, scoreToOwnerKey } from './future-utils';
import Square from './square';
import Player from './player';
import Score from './score';
import Legend from './legend';
import EditPlayers from './editPlayers';
import EditGame from './editGame';
import colors from './colors';
import type GridType from './types/grid';
import { LOCAL_STORAGE_KEY } from './constants';
import './Grid.css';
import type SquareType from './types/square';
import type PlayerType from './types/player';
import Modal from './modal';

const emptySquare = {
  ownerId: undefined,
} as SquareType;

const PERIOD = ['', '1st', '2nd', '3rd', '4th'];

function getEmptySquare(id: string): SquareType {
  return {
    ...emptySquare,
    id: id,
  };
}

const names = ['ENTER', 'PLAYERS’', 'INITIALS'];

const presetPlayers: Record<string, PlayerType> = Array(100)
  .fill(undefined)
  .map((_, id) => id)
  .reduce(
    (players, playerId) => ({
      ...players,
      [playerId]: getEmptyPlayer(playerId),
    }),
    {} as Record<string, PlayerType>,
  );

function getEmptyPlayer(id: number | string): PlayerType {
  return {
    color: colors[typeof id === 'number' ? id : parseInt(id, 10)],
    id: String(id),
    name: names[typeof id === 'number' ? id : parseInt(id, 10)],
  };
}

const ids = '0123456789'.split('');
const fullIds = ids.reduce(
  (grid, rowNumber: string) => [
    ...grid,
    ...ids.reduce(
      (row: string[], columnNumber: string) => [
        ...row,
        `${rowNumber}${columnNumber}`,
      ],
      [],
    ),
  ],
  [] as string[],
);

const initialGrid: GridType = fullIds.reduce(
  (grid, id) => ({
    ...grid,
    [id]: getEmptySquare(id),
  }),
  {} as GridType,
);

function randomizeGridForOwnerIds(ownerIds: string[]) {
  return shuffle(fullIds).reduce(
    (grid: GridType, id: string, index: number) => ({
      ...grid,
      [id]: {
        id,
        ownerId: ownerIds[index % ownerIds.length],
      },
    }),
    {} as GridType,
  );
}

function gridReducer(state: GridType, { type, payload }: any) {
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

interface Props {
  initialGridState?: GridType;
  initialPlayers?: Record<string, PlayerType>;
  initialAwayScore?: number[];
  initialHomeScore?: number[];
  initialHomeTeam?: string;
  initialAwayTeam?: string;
  initialGameId?: string;
}

export default function Grid({
  initialGridState,
  initialPlayers,
  initialAwayScore,
  initialHomeScore,
  initialHomeTeam,
  initialAwayTeam,
  initialGameId,
}: Props) {
  const [grid, dispatch] = useReducer(
    gridReducer,
    initialGridState || initialGrid,
  );
  const [players, setPlayers] = useState(initialPlayers || presetPlayers);
  const [activePlayerId, setActivePlayerId] = useState(0);
  const [isLocked, setIsLocked] = useState(!!initialPlayers);
  const [homeScore, setHomeScore] = useState(
    initialHomeScore || Array(10).fill('?'),
  );
  const [awayScore, setAwayScore] = useState(
    initialAwayScore || Array(10).fill('?'),
  );
  const [isEditPlayersModalOpen, setIsEditPlayersModalOpen] = useState(false);
  const [isEditGameModalOpen, setIsEditGameModalOpen] = useState(false);
  const [isAutoUpdating, setIsAutoUpdating] = useState(isLocked);

  const {
    gameState: {
      clock,
      period,
      games,
      gameId,
      homeTeam,
      awayTeam,
      home: homeActualScore,
      away: awayActualScore,
    },
    setGameState,
  } = useUpdateScores({
    shouldUpdate: isAutoUpdating,
    initialHomeTeam,
    initialAwayTeam,
    initialGameId,
  });

  const setGameId = useCallback(
    (gameId?: string) => {
      setGameState((prevState) => ({
        ...prevState,
        gameId,
      }));
    },
    [setGameState],
  );

  const setAwayActualScore = useCallback(
    (away: number) => {
      setGameState((prevState) => ({
        ...prevState,
        away,
      }));
    },
    [setGameState],
  );

  const setHomeActualScore = useCallback(
    (home: number) => {
      setGameState((prevState) => ({
        ...prevState,
        home,
      }));
    },
    [setGameState],
  );

  const editPlayers = useCallback(() => setIsEditPlayersModalOpen(true), []);
  const editGame = useCallback(() => setIsEditGameModalOpen(true), []);
  const closeEditPlayersModal = useCallback(
    () => setIsEditPlayersModalOpen(false),
    [],
  );
  const closeEditGameModal = useCallback(
    () => setIsEditGameModalOpen(false),
    [],
  );

  const namedPlayers = useMemo(
    () => Object.values(players).filter(({ name }) => !!name),
    [players],
  );

  const claim = useCallback(
    (id: string) => {
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
    [dispatch, isLocked, activePlayerId],
  );

  const unclaim = useCallback(
    (id: string) => {
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
    [dispatch, isLocked, activePlayerId],
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
        }),
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

  const setActualScore = useCallback(
    ({ target: { name, value } }: React.ChangeEvent<HTMLInputElement>) => {
      if (name === 'away-actual-score') {
        setAwayActualScore(parseInt(value, 10));
      } else {
        setHomeActualScore(parseInt(value, 10));
      }
    },
    [setAwayActualScore, setHomeActualScore],
  );

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
    (ownerId: string) => {
      return Object.keys(grid).filter((id) => grid[id].ownerId === ownerId);
    },
    [grid],
  );

  const scoreToOwnerIdMap = React.useMemo(() => {
    const updatedScoreToOwnerIdMap = Object.keys(grid).reduce(
      (map, id) => {
        const square = grid[id];

        if (square.ownerId !== undefined) {
          const homeScoreIndex = id[1];
          const awayScoreIndex = id[0];
          const scoreKey = scoreToOwnerKey(
            homeScore[parseInt(homeScoreIndex, 10)],
            awayScore[parseInt(awayScoreIndex, 10)],
          );
          map[scoreKey] = square.ownerId;
        }

        return map;
      },
      {} as Record<string, string>,
    );

    return updatedScoreToOwnerIdMap;
  }, [awayScore, grid, homeScore]);

  /**
   * @param {number} homeScore
   * @param {number} awayScore
   */
  function scoreToOwner(homeScore: number, awayScore: number) {
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

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const showSummary = useCallback(
    () => setIsSummaryOpen(true),
    [setIsSummaryOpen],
  );
  const hideSummary = useCallback(
    () => setIsSummaryOpen(false),
    [setIsSummaryOpen],
  );

  const scores = (
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
  );

  return (
    <div className="container">
      <div className="control-container">
        <div className="player-container">
          {namedPlayers.map(({ id, name, color }) => (
            <Player
              key={id}
              id={id}
              isActive={!isLocked && parseInt(id, 10) === activePlayerId}
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
          {isLocked && (
            <button onClick={showSummary} className="button">
              Summary
            </button>
          )}
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
          <Modal isOpen={isSummaryOpen} onClose={hideSummary}>
            {scores}

            {isSummaryOpen && (
              <>
                <h2>
                  <span
                    className="emphasize-name"
                    style={{
                      backgroundColor: scoreToOwner(
                        homeActualScore,
                        awayActualScore,
                      )?.color,
                    }}>
                    {scoreToOwner(homeActualScore, awayActualScore).name}
                  </span>{' '}
                  is leading, but...
                </h2>
                {allNextScores(
                  homeActualScore,
                  awayActualScore,
                  scoreToOwner,
                ).map((nextScore, idx) => {
                  if (!nextScore.owner?.name) {
                    return null;
                  }

                  const team =
                    nextScore.scorer === 'home' ? homeTeam : awayTeam;

                  return (
                    <div key={idx} className="win-conditional">
                      <div
                        className="emphasize-name"
                        style={{ backgroundColor: nextScore.owner.color }}>
                        {nextScore.owner.name}
                      </div>
                      wins if
                      <div className={`emphasize-name ${team.toLowerCase()}`}>
                        {team}
                      </div>
                      scores a{' '}
                      <span className="action-type">{nextScore.type}</span>
                      <span
                        className={`win-cond-score ${awayTeam.toLowerCase()}`}>
                        {nextScore.away}
                      </span>{' '}
                      -{' '}
                      <span
                        className={`win-cond-score ${homeTeam.toLowerCase()}`}>
                        {nextScore.home}
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </Modal>
        </div>
      </div>

      {scores}

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
          const { color, name } = players[grid[id].ownerId!] || {};
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
                awayScore[parseInt(id[0], 10)] ===
                  `${awayActualScore}`.charAt(
                    `${awayActualScore}`.length - 1,
                  ) &&
                homeScore[parseInt(id[1], 10)] ===
                  `${homeActualScore}`.charAt(`${homeActualScore}`.length - 1)
              }
            />
          );
          if (id[1] === '0') {
            const digit = awayScore[parseInt(id[0], 10)];
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
    </div>
  );
}
