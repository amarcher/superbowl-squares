import { minify, magnify, EMPTY_PLAYERS, INITIAL_GRID } from './utils';
import COLORS from './colors';
import type AppState from './types/appState';
import type SlimAppState from './types/slimAppState';

function makeAppState(overrides: Partial<AppState> = {}): AppState {
  return {
    grid: { ...INITIAL_GRID },
    players: { ...EMPTY_PLAYERS },
    homeScore: '0123456789'.split(''),
    awayScore: '9876543210'.split(''),
    homeTeam: 'SF',
    awayTeam: 'BAL',
    ...overrides,
  };
}

describe('minify / magnify', () => {
  it('serializes a named player without overrides as a bare string', () => {
    const players = { ...EMPTY_PLAYERS };
    players['0'] = { ...players['0'], name: 'Alice' };
    const slim = minify(makeAppState({ players }));
    expect(slim.players['0']).toBe('Alice');
  });

  it('serializes a player with a custom color and avatarUrl as an object', () => {
    const players = { ...EMPTY_PLAYERS };
    players['1'] = {
      ...players['1'],
      name: 'Bob',
      color: '#ff00ff',
      avatarUrl: 'https://blob.example/bob.webp',
    };
    const slim = minify(makeAppState({ players }));
    expect(slim.players['1']).toEqual({
      n: 'Bob',
      c: '#ff00ff',
      a: 'https://blob.example/bob.webp',
    });
  });

  it('drops players without a name', () => {
    const slim = minify(makeAppState());
    expect(Object.keys(slim.players)).toHaveLength(0);
  });

  it('magnifies the legacy string-only format (backward compat)', () => {
    const slim: SlimAppState = {
      grid: {},
      awayScore: '0123456789',
      homeScore: '9876543210',
      players: { '0': 'Alice', '1': 'Bob' },
      homeTeam: 'SF',
      awayTeam: 'BAL',
    };
    const full = magnify(slim);
    expect(full.players['0'].name).toBe('Alice');
    expect(full.players['0'].color).toBe(COLORS[0]);
    expect(full.players['0'].avatarUrl).toBeUndefined();
    expect(full.players['1'].name).toBe('Bob');
    expect(full.players['1'].color).toBe(COLORS[1]);
  });

  it('magnifies the new object format with color and avatarUrl', () => {
    const slim: SlimAppState = {
      grid: {},
      awayScore: '0123456789',
      homeScore: '9876543210',
      players: {
        '2': { n: 'Carol', c: '#abcdef', a: 'https://blob.example/carol.webp' },
      },
      homeTeam: 'SF',
      awayTeam: 'BAL',
    };
    const full = magnify(slim);
    expect(full.players['2'].name).toBe('Carol');
    expect(full.players['2'].color).toBe('#abcdef');
    expect(full.players['2'].avatarUrl).toBe('https://blob.example/carol.webp');
  });

  it('round-trips a player with avatar through minify -> magnify', () => {
    const players = { ...EMPTY_PLAYERS };
    players['3'] = {
      ...players['3'],
      name: 'Dani',
      color: '#123456',
      avatarUrl: 'https://blob.example/dani.webp',
    };
    const round = magnify(minify(makeAppState({ players })));
    expect(round.players['3']).toMatchObject({
      id: '3',
      name: 'Dani',
      color: '#123456',
      avatarUrl: 'https://blob.example/dani.webp',
    });
  });
});
