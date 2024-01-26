export default interface Game {
  gameId?: string;
  away: number;
  home: number;
  clock?: string;
  period?: number;
  homeTeam?: string;
  awayTeam?: string;
  games: Omit<Game, 'games'>;
}
