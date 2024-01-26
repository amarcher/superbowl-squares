import type PlayerType from './types/player';

interface Score {
  points: number;
  name: string;
  chance: number;
}

const SCORES: Score[] = [
  {
    points: 7,
    name: 'touchdown',
    chance: 0.7,
  },
  {
    points: 3,
    name: 'field goal',
    chance: 0.8,
  },
  {
    points: 8,
    name: 'touchdown + extra 2 points',
    chance: 0.2,
  },
  {
    points: 6,
    name: 'touchdown + missed kick',
    chance: 0.1,
  },
  {
    points: 2,
    name: 'safety',
    chance: 0.2,
  },
  /**
   * Below in comments for completeness, but we don't
   * want to show them in practice
   */
  // afterScoreExtraPoint: 1,
  // forceTurnoverScore: 2
];

export interface FuturePossibility {
  home: number;
  away: number;
  score: Score;
  scorer: 'home' | 'away';
  owner?: PlayerType;
  prior: FuturePossibility | null;
}

export function futureWinnerPossibilities(
  careAbout: -1 | string, // -1 means care about all, otherwise pass a player name
  homeScore: number,
  awayScore: number,
  scoreToOwner: (
    homeScore: number,
    awayScore: number,
  ) => PlayerType | undefined,
  depth: number,
  prior: FuturePossibility | null = null,
): Array<FuturePossibility> {
  let possibilities: Array<FuturePossibility> = [];

  function add(poss: FuturePossibility) {
    if (poss.owner && (careAbout === -1 || careAbout === poss.owner.name)) {
      possibilities.push(poss);
    }
  }

  for (let i = 0; i < SCORES.length; i++) {
    const score = SCORES[i];
    const homeScoreOption = homeScore + score.points;
    const awayScoreOption = awayScore + score.points;

    add({
      home: homeScoreOption,
      away: awayScore,
      score,
      scorer: 'home',
      owner: scoreToOwner(homeScoreOption, awayScore),
      prior,
    });
    add({
      home: homeScore,
      away: awayScoreOption,
      score,
      scorer: 'away',
      owner: scoreToOwner(homeScore, awayScoreOption),
      prior,
    });
  }

  if (depth > 1) {
    for (const possibility of possibilities) {
      possibilities = possibilities.concat(
        futureWinnerPossibilities(
          careAbout,
          possibility.home,
          possibility.away,
          scoreToOwner,
          depth - 1,
          possibility,
        ),
      );
    }
  }

  /**
   * Do not sort until we're at the end of the recursion
   */
  if (prior !== null) {
    return possibilities;
  }

  return possibilities.sort(sortPossibilities);
}

function sortPossibilities(possA: FuturePossibility, possB: FuturePossibility) {
  const ownerNameA = possA.owner?.name ?? '';
  const ownerNameB = possB.owner?.name ?? '';

  if (ownerNameA !== ownerNameB) {
    return ownerNameA.localeCompare(ownerNameB);
  }

  const chanceValueA = calculateChanceValue(possA);
  const chanceValueB = calculateChanceValue(possB);

  return chanceValueB - chanceValueA;
}

/**
 * This method is kind of dumb but basically we want to sort by chance
 * and we penalize for having more steps to reach a certain score
 */
function calculateChanceValue(poss: FuturePossibility): number {
  let chanceValue = 0;
  let count = 0;
  let priors = 0;

  let currentPoss: FuturePossibility | null = poss;
  while (currentPoss !== null) {
    chanceValue += currentPoss.score.chance;
    count++;
    currentPoss = currentPoss.prior;
    if (currentPoss !== null) {
      priors++;
    }
  }

  return count > 0 ? chanceValue / (count + priors) : 0;
}

export function scoreToOwnerKey(
  homeScore: number | string,
  awayScore: number | string,
): string {
  return `${homeScore},${awayScore}`;
}
