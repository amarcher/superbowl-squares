export default interface Game {
  gameId?: string;
  away: number;
  home: number;
  clock?: string;
  period?: number;
  homeTeam?: string;
  awayTeam?: 'AWAY';
  games: Omit<Game, 'games'>;
}
