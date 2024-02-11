import React, {
  useReducer,
  useCallback,
  useState,
  useMemo,
  useEffect,
} from 'react';
import toast from 'react-hot-toast';

import { useUpdateScores } from './hooks';
import {
  getRandomDigits,
  PRESET_PLAYERS,
  writeStateToUrl,
  randomizeGridForOwnerIds,
  INITIAL_GRID,
  minify,
  FULL_IDS,
} from './utils';
import Square from './square';
import Player from './player';
import Score from './score';
import Legend from './legend';
import EditPlayers from './editPlayers';
import EditGame from './editGame';
import type GridType from './types/grid';
import { LOCAL_STORAGE_KEY } from './constants';
import './Grid.css';
import type PlayerType from './types/player';
import SummaryModal from './summaryModal';
import { getShortUrl } from './linkShortener';

const PERIOD = ['', '1st', '2nd', '3rd', '4th'];

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
  initialAwayScore?: string[];
  initialHomeScore?: string[];
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
    initialGridState || { ...INITIAL_GRID },
  );
  const [players, setPlayers] = useState(
    initialPlayers || { ...PRESET_PLAYERS },
  );
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

  const serializableGameState = useMemo(
    () =>
      minify({
        homeScore,
        awayScore,
        grid,
        players,
        homeTeam,
        awayTeam,
        gameId,
      }),
    [homeScore, awayScore, grid, players, homeTeam, awayTeam, gameId],
  );

  const lock = useCallback(() => {
    setHomeScore(getRandomDigits());
    setAwayScore(getRandomDigits());
    setIsLocked(true);
    setIsAutoUpdating(true);
  }, []);

  useEffect(() => {
    if (isLocked) {
      writeStateToUrl(serializableGameState);

      if (window.localStorage) {
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(serializableGameState),
        );
      }
    }
  }, [serializableGameState, isLocked]);

  useEffect(() => {
    if (!isLocked && window.localStorage) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [isLocked]);

  const setActualScore = useCallback(
    ({ target: { name, value } }: React.ChangeEvent<HTMLInputElement>) => {
      const scoreToSet = name === 'away-actual-score' ? 'away' : 'home';
      const valueToSet =
        value && typeof value === 'string' ? parseInt(value, 10) : value;

      setGameState((prevState) => ({
        ...prevState,
        [scoreToSet]: valueToSet,
      }));
    },
    [setGameState],
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

  const share = useCallback(async () => {
    return getShortUrl(window.location.href).then(
      async (data: { secureShortURL: string }) => {
        const { secureShortURL } = data;

        const sharePayload = {
          url: secureShortURL,
          title: 'Superbowl Squares',
        };

        if (
          typeof navigator?.canShare === 'function' &&
          navigator.canShare(sharePayload)
        ) {
          await navigator.share();
          return;
        } else if (typeof navigator?.clipboard?.writeText === 'function') {
          try {
            await navigator.clipboard.writeText(secureShortURL);
            toast.success('Copied link to game');
            return;
          } catch {}
        }

        toast.error('Something went wrong');
      },
    );
  }, []);

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
          value={awayActualScore ?? ''}
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
          value={homeActualScore ?? ''}
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
          {!isLocked && (
            <>
              <button onClick={editPlayers} className="button">
                Players
              </button>
              <button onClick={autoPick} className="button">
                Auto-Pick
              </button>
              <button onClick={editGame} className="button hidden">
                Game
              </button>
            </>
          )}
          {isLocked && (
            <>
              <button onClick={share} className="button share">
                Share
              </button>
              <button onClick={showSummary} className="button">
                Summary
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
          <SummaryModal
            isOpen={isSummaryOpen}
            onClose={hideSummary}
            scores={scores}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            homeActualScore={homeActualScore}
            awayActualScore={awayActualScore}
            grid={grid}
            homeScore={homeScore}
            awayScore={awayScore}
            players={players}
          />
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
        {FULL_IDS.map((id) => {
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
