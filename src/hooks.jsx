import { useCallback, useEffect, useRef, useState } from 'react';
import 'whatwg-fetch';

const ESPN_ENDPOINT =
  'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';
const INTERVAL = 30 * 1000;

function get(endpoint) {
  return fetch(endpoint).then((response) => response.json());
}

export const INITIAL_GAME_TEMPLATE = {
  away: 0,
  home: 0,
  clock: '0:00',
  period: 0,
  eventIndex: 0,
  homeTeam: 'HOME',
  awayTeam: 'AWAY',
  games: [],
  gameId: undefined,
};

let gameData = { ...INITIAL_GAME_TEMPLATE };

let rawData = {};

function getGameData() {
  return get(ESPN_ENDPOINT).then((data) => {
    rawData = data;
    return data;
  });
}

function getEventIndex(gameId) {
  return (
    rawData?.events?.findIndex((event) => {
      return event?.id === gameId;
    }) || -1
  );
}

function getGameFromEvent(event) {
  if (!event) return INITIAL_GAME_TEMPLATE;

  const game = {
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

function getScores(gameId) {
  return getGameData().then((payload) => {
    const eventIndex = getEventIndex(gameId);
    if (rawData?.events && eventIndex !== -1) {
      gameData.eventIndex = eventIndex;
    }

    const games = payload?.events?.map(getGameFromEvent);
    const game = games[gameData.eventIndex];
    gameData.games = games;
    gameData.gameId = game.gameId;

    gameData.home = game.home;
    gameData.homeTeam = game.homeTeam;
    gameData.away = game.away;
    gameData.awayTeam = game.awayTeam;
    gameData.clock = game.clock;
    gameData.period = game.period;

    return gameData;
  });
}

function useInterval(callback, delay) {
  const intervalId = useRef(null);
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
    savedCallback.current();
  }, [callback]);

  useEffect(() => {
    const tick = () => savedCallback.current();

    if (typeof delay === 'number') {
      tick();
      intervalId.current = window.setInterval(tick, delay);
      return () => window.clearInterval(intervalId.current);
    }
  }, [delay]);

  return intervalId.current;
}

export function useUpdateScores(
  shouldUpdate,
  setHomeScore,
  setAwayScore,
  homeTeam,
  awayTeam,
  gameId,
  setGameId,
  setHomeTeam,
  setAwayTeam
) {
  const [gameState, setGameState] = useState({
    ...gameData,
    homeTeam: homeTeam || gameData.homeTeam,
    awayTeam: awayTeam || gameData.awayTeam,
  });

  const callback = useCallback(
    () =>
      getScores(gameId).then((data) => {
        setGameId(data.gameId);
        setGameState({ ...data });
        const { home, away, homeTeam, awayTeam } = data;
        setHomeScore(home);
        setAwayScore(away);
        setHomeTeam(homeTeam);
        setAwayTeam(awayTeam);
      }),
    [gameId, setHomeScore, setAwayScore, setHomeTeam, setAwayTeam, setGameId]
  );

  const intervalId = useInterval(callback, shouldUpdate ? INTERVAL : null);

  if (!shouldUpdate) clearInterval(intervalId);

  return gameState;
}
