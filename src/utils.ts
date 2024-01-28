import { encode, decode } from 'universal-base64url';
import type AppState from './types/appState';
import type SlimAppState from './types/slimAppState';
import type Player from './types/player';
import type Square from './types/square';
import type Grid from './types/grid';
import COLORS from './colors';

function encodeObject(obj: object): string {
  const str = JSON.stringify(obj);
  const encoded = encode(str);
  return encoded;
}

function decodeObject(encoded: string): object {
  const str = decode(encoded);
  const obj = JSON.parse(str);
  return obj;
}

export function getRandomDigits() {
  const array = '0123456789'.split('');
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function shuffle<T>(array: T[]) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

const PRESET_NAMES = ['ENTER', 'PLAYERS’', 'INITIALS'];

export const EMPTY_PLAYERS: Record<string, Player> = Array(100)
  .fill(undefined)
  .map((_, id) => id)
  .reduce(
    (players, playerId) => ({
      ...players,
      [playerId]: getEmptyPlayer(playerId),
    }),
    {} as Record<string, Player>,
  );

export const PRESET_PLAYERS: Record<string, Player> = {
  ...EMPTY_PLAYERS,
  '0': { ...EMPTY_PLAYERS['0'], name: PRESET_NAMES[0] },
  '1': { ...EMPTY_PLAYERS['1'], name: PRESET_NAMES[1] },
  '2': { ...EMPTY_PLAYERS['2'], name: PRESET_NAMES[2] },
};

export function getEmptyPlayer(id: number | string): Player {
  return {
    color: COLORS[typeof id === 'number' ? id : parseInt(id, 10)],
    id: String(id),
    name: '',
  };
}

const EMPTY_SQUARE = {
  ownerId: undefined,
} as Square;

function getEmptySquare(id: string): Square {
  return {
    ...EMPTY_SQUARE,
    id: id,
  };
}

const IDS = '0123456789'.split('');
export const FULL_IDS = IDS.reduce(
  (grid, rowNumber: string) => [
    ...grid,
    ...IDS.reduce(
      (row: string[], columnNumber: string) => [
        ...row,
        `${rowNumber}${columnNumber}`,
      ],
      [],
    ),
  ],
  [] as string[],
);

export const INITIAL_GRID: Grid = FULL_IDS.reduce(
  (grid, id) => ({
    ...grid,
    [id]: getEmptySquare(id),
  }),
  {} as Grid,
);

export function randomizeGridForOwnerIds(ownerIds: string[]) {
  return shuffle(FULL_IDS).reduce(
    (grid: Grid, id: string, index: number) => ({
      ...grid,
      [id]: {
        id,
        ownerId: ownerIds[index % ownerIds.length],
      },
    }),
    {} as Grid,
  );
}

export function minify({
  grid,
  awayScore,
  homeScore,
  players,
  homeTeam,
  awayTeam,
  gameId,
}: AppState): SlimAppState {
  const slimPlayers = Object.values(players).reduce(
    (namedPlayers: Record<string, string>, player: Player) => {
      if (!player.name) return namedPlayers;
      namedPlayers[player.id] = player.name;
      return namedPlayers;
    },
    {} as Record<string, string>,
  );

  const slimGrid = Object.values(grid).reduce(
    (slimGrid: Record<string, string>, { ownerId, id }: Square) => {
      if (ownerId == null || id == null) return slimGrid;
      slimGrid[id] = ownerId;
      return slimGrid;
    },
    {} as Record<string, string>,
  );

  return {
    players: slimPlayers,
    awayScore: awayScore.join(''),
    homeScore: homeScore.join(''),
    grid: slimGrid,
    homeTeam,
    awayTeam,
    gameId,
  };
}

export function magnify({
  grid,
  awayScore,
  homeScore,
  players,
  homeTeam,
  awayTeam,
  gameId,
}: SlimAppState): AppState {
  const largeAndBeautifulPlayers =
    Object.entries(players).length > 0
      ? Object.entries(players).reduce(
          (allPlayers, [playerId, playerName]) => {
            allPlayers[playerId].name = playerName;
            return allPlayers;
          },
          { ...EMPTY_PLAYERS },
        )
      : { ...PRESET_PLAYERS };

  console.log(largeAndBeautifulPlayers);
  console.log(Object.entries(players));

  const largeAndBeautifulGrid = Object.entries(grid).reduce(
    (bigGrid, [cellId, ownerId]) => {
      bigGrid[cellId].ownerId = ownerId;
      return bigGrid;
    },
    { ...INITIAL_GRID },
  );

  return {
    grid: largeAndBeautifulGrid,
    awayScore: awayScore.split(''),
    homeScore: homeScore.split(''),
    players: largeAndBeautifulPlayers,
    awayTeam,
    homeTeam,
    gameId,
  };
}

export function writeStateToUrl(state: SlimAppState) {
  window.location.hash = encodeObject(state);
}

export function readStateFromUrl(): AppState | null {
  const hash = window.location.hash.slice(1);
  if (!hash) {
    return null;
  }

  try {
    const appState = decodeObject(hash) as AppState;
    if (
      appState &&
      appState.grid &&
      appState.players &&
      appState.homeScore &&
      appState.awayScore
    ) {
      return appState;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
