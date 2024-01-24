const SCORES = {
  touchdown: 7,
  fieldgoal: 3,
  touchdownExtra: 8,
  touchdownMiss: 6,
  safety: 2,
  /**
   * Below in comments for completeness, but we don't
   * want to show them in practice
   */
  // afterScoreExtraPoint: 1,
  // forceTurnoverScore: 2
};

/**
 *
 * @param {number} homeScore
 * @param {number} awayScore
 */
export function allNextScores(homeScore: number, awayScore: number) {
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
      scorer: 'home',
    });
    combinations.push({
      home: homeScore,
      away: awayScoreOption,
      type: scoreType,
      scorer: 'away',
    });
  }

  return combinations;
}

/**
 * @param {number} homeScore
 * @param {number} awayScore
 * @returns {string}
 */
export function scoreToOwnerKey(homeScore: number, awayScore: number): string {
  return `${homeScore},${awayScore}`;
}
