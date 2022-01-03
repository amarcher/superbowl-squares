import { useCallback, useEffect, useRef, useState } from 'react';
import 'whatwg-fetch';

const ESPN_ENDPOINT =
  'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';
const INTERVAL = 30 * 1000;

function get(endpoint) {
  return fetch(endpoint).then((response) => response.json());
}

const gameData = {
  away: 0,
  home: 0,
  clock: '0:00',
  period: 0,
  eventIndex: 0,
  homeTeam: 'HOME',
  awayTeam: 'AWAY',
};

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

function getScores(gameId) {
  const eventIndex = getEventIndex(gameId);
  if (rawData?.events && eventIndex !== -1) {
    gameData.eventIndex = eventIndex;
  }

  return getGameData().then((payload) => {
    const competition =
      payload?.events &&
      payload?.events[gameData.eventIndex] &&
      payload?.events[gameData.eventIndex].competitions &&
      payload?.events[gameData.eventIndex].competitions[0];

    if (payload?.events[gameData.eventIndex]) {
      gameData.gameId = payload.events[gameData.eventIndex].id;
    }

    const { competitors, status } = competition || {};

    if (competitors) {
      competitors.forEach((competitor) => {
        if (competitor?.homeAway === 'home') {
          gameData.home = parseInt(competitor?.score, 10);
          gameData.homeTeam = competitor?.team?.abbreviation || 'HOME';
        } else {
          gameData.away = parseInt(competitor?.score, 10);
          gameData.awayTeam = competitor?.team?.abbreviation || 'AWAY';
        }
      });
    }

    if (status) {
      gameData.clock = status?.displayClock;
      gameData.period = status?.period;
    }

    return gameData;
  });
}

function useInterval(callback, delay) {
  const intervalId = useRef(null);
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
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
  initialHomeTeam,
  initialAwayTeam,
  initialGameId
) {
  const initialEventIndex = getEventIndex(initialGameId);
  const [gameState, setGameState] = useState({
    ...gameData,
    homeTeam: initialHomeTeam || gameData.homeTeam,
    awayTeam: initialAwayTeam || gameData.awayTeam,
    eventIndex:
      initialEventIndex !== -1 ? initialEventIndex : gameData.eventIndex,
  });

  const callback = useCallback(
    () =>
      getScores(initialGameId).then((data) => {
        setGameState({ ...data });
        const { home, away } = data;
        setHomeScore(home);
        setAwayScore(away);
      }),
    [setAwayScore, setHomeScore, initialGameId]
  );

  const intervalId = useInterval(callback, shouldUpdate ? INTERVAL : null);

  if (!shouldUpdate) clearInterval(intervalId);

  console.log(gameState);
  return gameState;
}
