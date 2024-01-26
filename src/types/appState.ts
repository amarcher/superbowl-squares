import type Grid from './grid';
import type Player from './player';

export default interface AppState {
  grid: Grid;
  awayScore: string[];
  homeScore: string[];
  players: Record<string, Player>;
  homeTeam: string;
  awayTeam: string;
  gameId?: string;
}
