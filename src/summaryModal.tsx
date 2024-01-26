import React, { useCallback } from 'react';
import {
  FuturePossibility,
  futureWinnerPossibilities,
  scoreToOwnerKey,
} from './future-utils';
import Modal from './modal';
import Grid from './types/grid';
import Players from './types/player';
import './summary.css';

interface Props {
  onClose: () => void;
  isOpen: boolean;
  grid: Grid;
  homeScore: string[];
  awayScore: string[];
  players: Record<string, Players>;
  homeActualScore: number;
  awayActualScore: number;
  homeTeam: string;
  awayTeam: string;
  scores?: React.ReactElement;
}

export default function SummaryModal({
  onClose,
  isOpen,
  grid,
  homeScore,
  awayScore,
  players,
  homeActualScore,
  awayActualScore,
  awayTeam,
  homeTeam,
  scores,
}: Props) {
  const scoreToOwnerIdMap = React.useMemo(() => {
    const updatedScoreToOwnerIdMap = Object.keys(grid).reduce(
      (map, id) => {
        const square = grid[id];

        // If the square has an owner, calculate the score key based on the home and away scores.
        // Then, assign the owner ID to the score key in the map.
        if (square.ownerId !== undefined) {
          const homeScoreIndex = id[1];
          const awayScoreIndex = id[0];
          const scoreKey = scoreToOwnerKey(
            homeScore[parseInt(homeScoreIndex, 10)],
            awayScore[parseInt(awayScoreIndex, 10)],
          );
          map[scoreKey] = square.ownerId;
        }

        return map;
      },
      {} as Record<string, string>,
    );

    return updatedScoreToOwnerIdMap;
  }, [awayScore, grid, homeScore]);

  const scoreToOwner = useCallback(
    (homeScore: number, awayScore: number) =>
      players[
        scoreToOwnerIdMap[scoreToOwnerKey(homeScore % 10, awayScore % 10)]
      ],
    [players, scoreToOwnerIdMap],
  );

  const [focus, setFocus] = React.useState<-1 | string>(-1);

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <div className="summary-inner">
        {scores}
        <h2>
          <span
            className="emphasize-name"
            style={{
              backgroundColor: scoreToOwner(homeActualScore, awayActualScore)
                ?.color,
            }}>
            {scoreToOwner(homeActualScore, awayActualScore).name}
          </span>{' '}
          is leading, but...
        </h2>
        <div className="summary-focus">
          focus on:{' '}
          <button
            key={'____all'}
            onClick={() => {
              setFocus(-1);
            }}>
            All Players
          </button>
          {Object.values(players)
            .filter((player) => player.name)
            .map((player) => {
              return (
                <button
                  key={player.name}
                  onClick={() => {
                    if (player.name) {
                      setFocus(player.name);
                    }
                  }}>
                  {player.name}
                </button>
              );
            })}
        </div>
        {futureWinnerPossibilities(
          focus,
          homeActualScore,
          awayActualScore,
          scoreToOwner,
          focus === -1 ? 1 : 2,
        ).map((nextScore, idx) => {
          return (
            <>
              <WinnerPossibilityView
                key={idx}
                nextScore={nextScore}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
              />
              <hr />
            </>
          );
        })}
      </div>
    </Modal>
  );
}

interface WinnerProps {
  key: number;
  nextScore: FuturePossibility;
  homeTeam: string;
  awayTeam: string;
  isPrior?: boolean;
}

function WinnerPossibilityView({
  key,
  nextScore,
  homeTeam,
  awayTeam,
  isPrior,
}: WinnerProps) {
  if (!nextScore.owner?.name) {
    return null;
  }

  const team = nextScore.scorer === 'home' ? homeTeam : awayTeam;

  return (
    <>
      <div className="win-conditional">
        <div
          className="emphasize-name"
          style={{
            backgroundColor: nextScore.owner.color,
            visibility: isPrior ? 'hidden' : 'visible',
          }}>
          {nextScore.owner.name}
        </div>
        {!isPrior ? <>leads if</> : <>...after</>}
        <div className={`emphasize-name ${team.toLowerCase()}`}>{team}</div>
        scores a <span className="action-type">{nextScore.score.name}</span>
        <span className={`win-cond-score ${awayTeam.toLowerCase()}`}>
          {nextScore.away}
        </span>{' '}
        -{' '}
        <span className={`win-cond-score ${homeTeam.toLowerCase()}`}>
          {nextScore.home}
        </span>
      </div>
      {nextScore.prior ? (
        <WinnerPossibilityView
          key={key}
          nextScore={nextScore.prior}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          isPrior={true}
        />
      ) : null}
    </>
  );
}
