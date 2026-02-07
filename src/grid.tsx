import React, {
  useReducer,
  useCallback,
  useState,
  useMemo,
  useEffect,
} from 'react';
import toast from 'react-hot-toast';

import { useUpdateScores, REFRESH_INTERVAL } from './hooks';
import {
  getRandomDigits,
  PRESET_PLAYERS,
  writeStateToUrl,
  randomizeGridForOwnerIds,
  INITIAL_GRID,
  minify,
  FULL_IDS,
} from './utils';
import {
  futureWinnerPossibilities,
  scoreToOwnerKey,
} from './future-utils';
import Square from './square';
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
import WinnerDisplay from './components/WinnerDisplay';
import CompactHeader from './components/CompactHeader';
import { PLAYER_COLORS } from './colors';

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
      if (String(currentOwnerId) !== String(payload.ownerId)) {
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
  const [showPotentialWinners, setShowPotentialWinners] = useState(false);

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
      startDate,
    },
    setGameState,
    manualRefresh,
    lastRefresh,
  } = useUpdateScores({
    shouldUpdate: isAutoUpdating,
    initialHomeTeam,
    initialAwayTeam,
    initialGameId,
  });

  // Countdown to game start
  const [countdown, setCountdown] = useState<string | null>(null);
  useEffect(() => {
    if (!startDate || period > 0) {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const gameStart = new Date(startDate).getTime();
      const diff = gameStart - now;

      if (diff <= 0) {
        setCountdown(null);
        return;
      }

      const totalHours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (n: number) => n.toString().padStart(2, '0');
      setCountdown(`${totalHours}:${pad(minutes)}:${pad(seconds)}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [startDate, period]);

  // Countdown to next auto-refresh
  const [refreshCountdown, setRefreshCountdown] = useState<number>(REFRESH_INTERVAL / 1000);
  useEffect(() => {
    if (!isAutoUpdating) {
      setRefreshCountdown(REFRESH_INTERVAL / 1000);
      return;
    }

    const updateRefreshCountdown = () => {
      const elapsed = Date.now() - lastRefresh;
      const remaining = Math.max(0, Math.ceil((REFRESH_INTERVAL - elapsed) / 1000));
      setRefreshCountdown(remaining);
    };

    updateRefreshCountdown();
    const interval = setInterval(updateRefreshCountdown, 1000);
    return () => clearInterval(interval);
  }, [isAutoUpdating, lastRefresh]);

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

  const togglePotentialWinners = useCallback(() => {
    setShowPotentialWinners((prev) => !prev);
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
          text: 'Keep track of the game!',
        };

        if (
          typeof navigator?.canShare === 'function' &&
          navigator.canShare(sharePayload)
        ) {
          try {
            await navigator.share(sharePayload);
            return;
          } catch (err) {
            // User canceled the share - this is normal, don't show an error
            if (err instanceof Error && err.name === 'AbortError') {
              return;
            }
            // For other errors, fall through to clipboard or error toast
          }
        }

        if (typeof navigator?.clipboard?.writeText === 'function') {
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

  const scoreToOwnerIdMap = useMemo(() => {
    const updatedScoreToOwnerIdMap = Object.keys(grid).reduce(
      (map, id) => {
        const square = grid[id];

        // If the square has an owner, calculate the score key based on the home and away scores.
        // Then, assign the owner ID to the score key in the map.
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

  const scoreToOwner = useCallback(
    (homeScoreNum: number, awayScoreNum: number) =>
      players[
        scoreToOwnerIdMap[
          scoreToOwnerKey(homeScoreNum % 10, awayScoreNum % 10)
        ]
      ],
    [players, scoreToOwnerIdMap],
  );

  const { depth1WinningSquareIds, depth2WinningSquareIds } = useMemo(() => {
    if (!showPotentialWinners || !isLocked) {
      return { depth1WinningSquareIds: new Set<string>(), depth2WinningSquareIds: new Set<string>() };
    }

    // Get depth 1 possibilities (single scoring play)
    const depth1Possibilities = futureWinnerPossibilities(
      -1, // all players
      homeActualScore,
      awayActualScore,
      scoreToOwner,
      1, // depth 1 for single-play scenarios
    );

    // Get all depth 2 possibilities (single and multi-play scenarios)
    const allDepth2Possibilities = futureWinnerPossibilities(
      -1, // all players
      homeActualScore,
      awayActualScore,
      scoreToOwner,
      2, // depth 2
    );

    const depth1SquareIds = new Set<string>();
    const depth2SquareIds = new Set<string>();

    depth1Possibilities.forEach((possibility) => {
      const homeLastDigit = String(possibility.home % 10);
      const awayLastDigit = String(possibility.away % 10);

      const homeIndex = homeScore.findIndex((digit) => digit === homeLastDigit);
      const awayIndex = awayScore.findIndex((digit) => digit === awayLastDigit);

      if (homeIndex !== -1 && awayIndex !== -1) {
        const squareId = `${awayIndex}${homeIndex}`;
        depth1SquareIds.add(squareId);
      }
    });

    // Depth 2 includes everything, so we need to separate depth 2-only squares
    allDepth2Possibilities.forEach((possibility) => {
      const homeLastDigit = String(possibility.home % 10);
      const awayLastDigit = String(possibility.away % 10);

      const homeIndex = homeScore.findIndex((digit) => digit === homeLastDigit);
      const awayIndex = awayScore.findIndex((digit) => digit === awayLastDigit);

      if (homeIndex !== -1 && awayIndex !== -1) {
        const squareId = `${awayIndex}${homeIndex}`;
        // Only add to depth2 if it's not already in depth1
        if (!depth1SquareIds.has(squareId)) {
          depth2SquareIds.add(squareId);
        }
      }
    });

    return { depth1WinningSquareIds: depth1SquareIds, depth2WinningSquareIds: depth2SquareIds };
  }, [
    showPotentialWinners,
    isLocked,
    homeActualScore,
    awayActualScore,
    scoreToOwner,
    homeScore,
    awayScore,
  ]);

  const squareToScoringScenarios = useMemo(() => {
    const scenarioMap = new Map<string, any[]>();

    if (!isLocked) {
      return scenarioMap;
    }

    const allPossibilities = futureWinnerPossibilities(
      -1,
      homeActualScore,
      awayActualScore,
      scoreToOwner,
      2
    );

    allPossibilities.forEach((possibility) => {
      const homeLastDigit = String(possibility.home % 10);
      const awayLastDigit = String(possibility.away % 10);

      const homeIndex = homeScore.findIndex(d => d === homeLastDigit);
      const awayIndex = awayScore.findIndex(d => d === awayLastDigit);

      if (homeIndex !== -1 && awayIndex !== -1) {
        const squareId = `${awayIndex}${homeIndex}`;

        if (!scenarioMap.has(squareId)) {
          scenarioMap.set(squareId, []);
        }

        scenarioMap.get(squareId)!.push(possibility);
      }
    });

    return scenarioMap;
  }, [isLocked, homeActualScore, awayActualScore, scoreToOwner, homeScore, awayScore]);

  const currentWinner = useMemo(() => {
    if (homeActualScore == null || awayActualScore == null) return null;

    const homeLastDigit = String(homeActualScore).slice(-1);
    const awayLastDigit = String(awayActualScore).slice(-1);

    const squareId = Object.keys(grid).find((id) => {
      return (
        homeScore[parseInt(id[1], 10)] === homeLastDigit &&
        awayScore[parseInt(id[0], 10)] === awayLastDigit
      );
    });

    if (!squareId) return null;

    const square = grid[squareId];
    const owner = square.ownerId !== undefined ? players[square.ownerId] : null;

    return {
      ownerName: owner?.name || 'Unclaimed',
      homeDigit: parseInt(homeLastDigit),
      awayDigit: parseInt(awayLastDigit),
    };
  }, [homeActualScore, awayActualScore, homeScore, awayScore, grid, players]);

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const showSummary = useCallback(
    () => setIsSummaryOpen(true),
    [setIsSummaryOpen],
  );
  const hideSummary = useCallback(
    () => setIsSummaryOpen(false),
    [setIsSummaryOpen],
  );

  const homeActiveDigit = homeActualScore != null ? String(homeActualScore).slice(-1) : null;
  const awayActiveDigit = awayActualScore != null ? String(awayActualScore).slice(-1) : null;

  const scores = (
    <div className="score-container">
      <div className="team-score-block">
        <div className="team-label">{awayTeam || 'AWAY'}</div>
        <input
          onChange={setActualScore}
          value={awayActualScore ?? ''}
          name="away-actual-score"
          placeholder="0"
          className="score-input"
          type="number"
          min="0"
          disabled={isAutoUpdating}
        />
      </div>
      <div className="score-divider">—</div>
      <div className="team-score-block">
        <div className="team-label">{homeTeam || 'HOME'}</div>
        <input
          onChange={setActualScore}
          value={homeActualScore ?? ''}
          name="home-actual-score"
          placeholder="0"
          className="score-input"
          type="number"
          min="0"
          disabled={isAutoUpdating}
        />
      </div>
    </div>
  );

  return (
    <div className="container">
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

      <div className="layout-wrapper">
        <div className="grid-column">
          <div className={`grid-container${isLocked ? ' locked' : ''}`}>
        <Legend x={homeTeam} y={awayTeam} />
        {homeScore.map((digit, index) => (
          <Score
            key={`homeDigit_${index}`}
            digit={digit}
            className={homeTeam?.toLowerCase()}
            isActive={digit !== '?' && digit === homeActiveDigit}
          />
        ))}
        {FULL_IDS.map((id) => {
          const ownerId = grid[id].ownerId;
          const {
            color,
            name,
          } = players[ownerId!] || {};
          const square = (
            <Square
              key={id}
              ownerColor={color}
              ownerTextColor={ownerId !== undefined ? PLAYER_COLORS[ownerId]?.text : undefined}
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
              isDepth1PotentialWinner={depth1WinningSquareIds.has(id)}
              isDepth2PotentialWinner={depth2WinningSquareIds.has(id)}
              isNonPotential={
                showPotentialWinners &&
                !depth1WinningSquareIds.has(id) &&
                !depth2WinningSquareIds.has(id)
              }
              scoringScenarios={squareToScoringScenarios.get(id) || []}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
            />
          );
          if (id[1] === '0') {
            const digit = awayScore[parseInt(id[0], 10)];
            const key = `awayDigit_${digit === '?' ? id[0] : digit}`;
            return (
              <React.Fragment key={key}>
                <Score digit={digit} className={awayTeam?.toLowerCase()} isActive={digit !== '?' && digit === awayActiveDigit} />
                {square}
              </React.Fragment>
            );
          }

          return square;
        })}
          </div>
        </div>

        <div className="sidebar-column">
          {isLocked ? (
            <CompactHeader
              onShare={share}
              onSummary={showSummary}
              onShowNext={togglePotentialWinners}
              onUnlock={unlock}
              showPotentialWinners={showPotentialWinners}
            />
          ) : (
            <div className="control-container">
              <div className="button-group">
                <button onClick={editPlayers} className="button">
                  Players
                </button>
                <button onClick={autoPick} className="button">
                  Auto-Pick
                </button>
                <button onClick={editGame} className="button hidden">
                  Game
                </button>
                <button onClick={lock} className="button primary">
                  Lock
                </button>
              </div>
            </div>
          )}

          {isLocked && currentWinner && (
            <WinnerDisplay
              ownerName={currentWinner.ownerName}
              homeDigit={currentWinner.homeDigit}
              awayDigit={currentWinner.awayDigit}
              homeTeam={homeTeam || 'HOME'}
              awayTeam={awayTeam || 'AWAY'}
            />
          )}

          <div className="scoreboard">
            {scores}
            {(period > 0 || clock || countdown) && (
              <div className="game-info">
                {period > 0 && <div className="period-label">{PERIOD[period]}</div>}
                {period > 0 && clock && <div className="clock-label">{clock}</div>}
                {!period && countdown && (
                  <>
                    <div className="period-label">Starts in:</div>
                    <div className="clock-label">{countdown}</div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="refresh-control">
            <label>
              <input
                type="checkbox"
                checked={isAutoUpdating}
                onChange={toggleIsAutoUpdating}
              />{' '}
              Auto-update
            </label>
            {isAutoUpdating && <span className="refresh-countdown">({refreshCountdown}s)</span>}
            <button className="refresh-btn" onClick={manualRefresh} type="button">
              Refresh
            </button>
          </div>

          {!isLocked && (
            <div className="player-legend">
              {namedPlayers.map(({ id, name, color }) => (
                <div
                  key={id}
                  className={`legend-item clickable${parseInt(id, 10) === activePlayerId ? ' active' : ''}`}
                  onClick={() => setActivePlayerId(parseInt(id, 10))}
                >
                  <div className="legend-swatch" style={{ background: color }} />
                  <span>{name} ({getSquaresOwnedByPlayer(id).length})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
