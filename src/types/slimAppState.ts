export type SlimPlayer =
  | string
  | {
      n: string;
      c?: string;
      a?: string;
    };

export default interface SlimAppState {
  grid: Record<string, string>; // [squareId]: playerId
  awayScore: string; // 1234567890
  homeScore: string; // 1234567890
  players: Record<string, SlimPlayer>; // [playerId]: name | { n, c?, a? }
  homeTeam: string; // BAL
  awayTeam: string; // SF
  gameId?: string;
}
