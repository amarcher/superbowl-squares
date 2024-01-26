export default interface SlimAppState {
  grid: Record<string, string>; // [squareId]: playerId
  awayScore: string; // 1234567890
  homeScore: string; // 1234567890
  players: Record<string, string>; // [playerId]: name
  homeTeam: string; // BAL
  awayTeam: string; // SF
  gameId?: string;
}
