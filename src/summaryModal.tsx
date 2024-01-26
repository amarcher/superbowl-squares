import React, { useCallback } from 'react';
import { allNextScores, scoreToOwnerKey } from './future-utils';
import Modal from './modal';
import Grid from './types/grid';
import Players from './types/player';

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
      players[scoreToOwnerIdMap[scoreToOwnerKey(homeScore, awayScore)]],
    [players, scoreToOwnerIdMap],
  );

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      {isOpen && (
        <>
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
          {allNextScores(homeActualScore, awayActualScore, scoreToOwner).map(
            (nextScore, idx) => {
              if (!nextScore.owner?.name) {
                return null;
              }

              const team = nextScore.scorer === 'home' ? homeTeam : awayTeam;

              return (
                <div key={idx} className="win-conditional">
                  <div
                    className="emphasize-name"
                    style={{ backgroundColor: nextScore.owner.color }}>
                    {nextScore.owner.name}
                  </div>
                  wins if
                  <div className={`emphasize-name ${team.toLowerCase()}`}>
                    {team}
                  </div>
                  scores a <span className="action-type">{nextScore.type}</span>
                  <span className={`win-cond-score ${awayTeam.toLowerCase()}`}>
                    {nextScore.away}
                  </span>{' '}
                  -{' '}
                  <span className={`win-cond-score ${homeTeam.toLowerCase()}`}>
                    {nextScore.home}
                  </span>
                </div>
              );
            },
          )}
        </>
      )}
    </Modal>
  );
}
