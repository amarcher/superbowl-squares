import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import type Event from './types/event';
import type Game from './types/game';
import 'whatwg-fetch';

const ESPN_ENDPOINT =
  'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';
const INTERVAL = 30 * 1000;

function get(endpoint: string) {
  return fetch(endpoint).then((response) => response.json());
}

export const INITIAL_GAME_TEMPLATE = {
  away: 0,
  home: 0,
  clock: '0:00',
  period: 0,
  homeTeam: 'HOME',
  awayTeam: 'AWAY',
  games: [],
  gameId: undefined,
};

function getGameFromEvent(event: Event) {
  if (!event) return INITIAL_GAME_TEMPLATE;

  const game = {
    ...INITIAL_GAME_TEMPLATE,
    gameId: event.id,
  };
  const competition = event?.competitions?.[0];
  const { competitors, status } = competition || {};
  if (competitors) {
    competitors.forEach((competitor) => {
      if (competitor?.homeAway === 'home') {
        game.home = parseInt(competitor?.score, 10);
        game.homeTeam = competitor?.team?.abbreviation || 'HOME';
      } else {
        game.away = parseInt(competitor?.score, 10);
        game.awayTeam = competitor?.team?.abbreviation || 'AWAY';
      }
    });
  }

  if (status) {
    game.clock = status?.displayClock;
    game.period = status?.period;
  }

  return game;
}

function getScores(gameId?: string) {
  return get(ESPN_ENDPOINT).catch((error) => {
    console.log(error);
    // TODO (handle errors)
  });
}

function useInterval(callback: () => void, delay?: number | null) {
  const intervalId = useRef<number | null>(null);
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
    savedCallback.current();
  }, [callback]);

  useEffect(() => {
    const tick = () => savedCallback.current();

    if (typeof delay === 'number') {
      tick();
      intervalId.current = window.setInterval(tick, delay) as number;
      return () => {
        if (intervalId.current) window.clearInterval(intervalId.current);
      };
    }
  }, [delay]);

  return intervalId.current;
}

export function useUpdateScores({
  shouldUpdate,
  initialHomeTeam = INITIAL_GAME_TEMPLATE.homeTeam,
  initialAwayTeam = INITIAL_GAME_TEMPLATE.awayTeam,
  initialGameId,
}: {
  shouldUpdate: boolean;
  initialHomeTeam?: string;
  initialAwayTeam?: string;
  initialGameId?: string;
}) {
  const [gameState, setGameState] = useState({
    ...INITIAL_GAME_TEMPLATE,
    homeTeam: initialHomeTeam,
    awayTeam: initialAwayTeam,
    gameId: initialGameId,
  });

  const callback = useCallback(
    () =>
      getScores(gameState.gameId).then((payload) => {
        const games = payload?.events?.map(getGameFromEvent);
        const game =
          games.find((game: Game) => game.gameId === gameState.gameId) ||
          games[0];

        setGameState((prevGameState) => ({
          ...prevGameState,
          ...game,
          games,
        }));

        return {
          ...game,
          games,
        };
      }),
    [gameState.gameId],
  );

  const intervalId = useInterval(callback, shouldUpdate ? INTERVAL : null);

  if (!shouldUpdate && intervalId) clearInterval(intervalId);

  return useMemo(() => ({ gameState, setGameState }), [gameState]);
}
