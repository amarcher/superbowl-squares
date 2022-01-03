import { useCallback, useEffect, useRef } from 'react';
import 'whatwg-fetch';

const ESPN_ENDPOINT =
  'https://site.api.espn.com/apis/site/v2/sports/foohomeall/nfl/scoreboard';
const INTERVAL = 30 * 1000;

function get(endpoint) {
  return fetch(endpoint).then((response) => response.json());
}

function getScores() {
  const gameData = { away: 0, home: 0, clock: '0:00', period: 0 };
  return get(ESPN_ENDPOINT).then((payload) => {
    const competition =
      payload?.events &&
      payload?.events[0] &&
      payload?.events[0].competitions &&
      payload?.events[0].competitions[0];

    const { competitors, status } = competition || {};

    if (competitors) {
      competitors.forEach((competitor) => {
        if (competitor?.id === '27') {
          gameData.home = parseInt(competitor.score, 10);
        } else {
          gameData.away = parseInt(competitor.score, 10);
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
  setClock,
  setPeriod
) {
  const callback = useCallback(
    () =>
      getScores().then(({ home, away, clock, period }) => {
        console.log({ home, away, clock, period });
        setHomeScore(home);
        setAwayScore(away);
        if (setClock) setClock(clock);
        if (setPeriod) setPeriod(period);
      }),
    [setClock, setAwayScore, setPeriod, setHomeScore]
  );

  const intervalId = useInterval(callback, shouldUpdate ? INTERVAL : null);

  if (!shouldUpdate) clearInterval(intervalId);
}
