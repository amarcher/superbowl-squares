import type PlayerType from "./types/player";

const SCORES = {
  touchdown: 7,
  "field goal": 3,
  "touchdown + extra 2 points": 8,
  "touchdown + missed kick": 6,
  safety: 2,
  /**
   * Below in comments for completeness, but we don't
   * want to show them in practice
   */
  // afterScoreExtraPoint: 1,
  // forceTurnoverScore: 2
};

export function allNextScores(
  homeScore: number,
  awayScore: number,
  scoreToOwner: (homeScore: number, awayScore: number) => PlayerType
) {
  const scoreOptions = Object.entries(SCORES);
  const combinations = [];

  for (let i = 0; i < scoreOptions.length; i++) {
    const [scoreType, scoreValue] = scoreOptions[i];
    const homeScoreOption = homeScore + scoreValue;
    const awayScoreOption = awayScore + scoreValue;

    combinations.push({
      home: homeScoreOption,
      away: awayScore,
      type: scoreType,
      scorer: "home",
      owner: scoreToOwner(homeScoreOption, awayScore),
    });
    combinations.push({
      home: homeScore,
      away: awayScoreOption,
      type: scoreType,
      scorer: "away",
      owner: scoreToOwner(homeScore, awayScoreOption),
    });
  }

  return combinations.sort((a, b) => {
    return (a.owner?.name ?? 0) > (b.owner?.name ?? 0) ? 1 : -1;
  });
}

export function scoreToOwnerKey(homeScore: number, awayScore: number): string {
  return `${homeScore},${awayScore}`;
}
