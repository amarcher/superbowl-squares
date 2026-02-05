export interface ScoringScenario {
  description: string;
  icon: string;
  probability: 'high' | 'medium' | 'low';
  nextScore: {
    home: number;
    away: number;
  };
}

export interface SquareWinInfo {
  ownerId?: number;
  ownerName: string;
  coordinates: {
    home: number;
    away: number;
  };
  isCurrentWinner: boolean;
  scenarios: ScoringScenario[];
}
