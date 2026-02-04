import React, { useCallback } from 'react';
import {
  FuturePossibility,
  futureWinnerPossibilities,
  scoreToOwnerKey,
} from './future-utils';
import Modal from './modal';
import Grid from './types/grid';
import Player from './types/player';
import ScoreIcon from './ScoreIcon';
import './summary.css';


interface Props {
  onClose: () => void;
  isOpen: boolean;
  grid: Grid;
  homeScore: string[];
  awayScore: string[];
  players: Record<string, Player>;
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

  const winningSquaresOwningPlayer: Player | undefined = scoreToOwner(
    homeActualScore,
    awayActualScore,
  );

  const [focus, setFocus] = React.useState<-1 | string>(-1);

  return (
    <Modal onClose={onClose} isOpen={isOpen} headerContent={scores}>
      <div className="summary-inner">
        <h2>
          <span
            className="emphasize-name"
            style={{
              borderLeft: `3px solid ${winningSquaresOwningPlayer?.color || '#e5e7eb'}`,
            }}>
            {winningSquaresOwningPlayer?.name || 'Noone'}
          </span>{' '}
          is leading, but...
        </h2>
        <div className="summary-focus">
          focus on:{' '}
          <button
            key={'____all'}
            className={focus === -1 ? 'active' : ''}
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
                  key={player.id}
                  style={{
                    borderLeft: `3px solid ${player.color}`,
                    background: focus === player.name ? '#f3f4f6' : undefined,
                  }}
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
            <React.Fragment key={idx}>
              <WinnerPossibilityView
                nextScore={nextScore}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
              />
              <hr />
            </React.Fragment>
          );
        })}
      </div>
    </Modal>
  );
}

interface WinnerProps {
  nextScore: FuturePossibility;
  homeTeam: string;
  awayTeam: string;
  isPrior?: boolean;
}

function WinnerPossibilityView({
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
            borderLeft: `3px solid ${nextScore.owner.color}`,
            visibility: isPrior ? 'hidden' : 'visible',
          }}>
          {nextScore.owner.name}
        </div>
        {!isPrior ? <>leads if</> : <>...after</>}
        <div className={`emphasize-name ${team.toLowerCase()}`}>{team}</div>
        scores a <ScoreIcon name={nextScore.score.name} />
        <div className="score-pair">
          <span className={`win-cond-score ${awayTeam.toLowerCase()}`}>
            {nextScore.away}
          </span>
          –
          <span className={`win-cond-score ${homeTeam.toLowerCase()}`}>
            {nextScore.home}
          </span>
        </div>
      </div>
      {nextScore.prior ? (
        <WinnerPossibilityView
          nextScore={nextScore.prior}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          isPrior
        />
      ) : null}
    </>
  );
}
