import React, { useCallback, useMemo, useState, useRef, useLayoutEffect } from 'react';

import './Square.css';
import { PROBABILITY_COLORS } from './colors';
import ScoreIcon from './ScoreIcon';

interface Props {
  id: string;
  isCurrentWinner?: boolean;
  isDepth1PotentialWinner?: boolean;
  isDepth2PotentialWinner?: boolean;
  isNonPotential?: boolean;
  ownerColor?: string;
  ownerTextColor?: string;
  ownerName?: string;
  claim: (id: string) => void;
  unclaim: (id: string) => void;
  scoringScenarios?: any[];
  homeTeam?: string;
  awayTeam?: string;
}

export default function Square({
  id,
  isCurrentWinner,
  isDepth1PotentialWinner,
  isDepth2PotentialWinner,
  isNonPotential,
  ownerColor,
  ownerTextColor,
  ownerName,
  claim,
  unclaim,
  scoringScenarios = [],
  homeTeam = 'HOME',
  awayTeam = 'AWAY',
}: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'left' | 'right' | 'center'>('center');
  const [tooltipVertical, setTooltipVertical] = useState<'above' | 'below'>('below');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (showTooltip && buttonRef.current && tooltipRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Check horizontal position - check if centering would cause overflow
      const tooltipCenterLeft = buttonRect.left + buttonRect.width / 2 - tooltipRect.width / 2;
      const tooltipCenterRight = tooltipCenterLeft + tooltipRect.width;

      if (tooltipCenterRight > viewportWidth - 20) {
        // Would overflow right, so align right edge of tooltip with right edge of square
        setTooltipPosition('right');
      }
      else if (tooltipCenterLeft < 20) {
        // Would overflow left, so align left edge of tooltip with left edge of square
        setTooltipPosition('left');
      }
      else {
        setTooltipPosition('center');
      }

      // Check vertical position
      if (buttonRect.bottom + tooltipRect.height + 8 > viewportHeight - 20) {
        setTooltipVertical('above');
      } else {
        setTooltipVertical('below');
      }
    }
  }, [showTooltip]);

  const onClick = useCallback(() => {
    if (ownerColor) {
      unclaim(id);
    } else {
      claim(id);
    }
  }, [claim, unclaim, id, ownerColor]);

  const style = useMemo(
    () => ({
      background: isCurrentWinner ? '#fef3c7' : (ownerColor || 'white'),
      color: ownerTextColor || (ownerName ? '#1f2937' : 'inherit'),
    }),
    [ownerColor, ownerTextColor, ownerName, isCurrentWinner],
  );

  const hasScenarios = scoringScenarios.length > 0;

  const probabilityDotColor = useMemo(() => {
    if (!(isDepth1PotentialWinner || isDepth2PotentialWinner) || !scoringScenarios.length) return null;
    const maxChance = Math.max(...scoringScenarios.map((s: any) =>
      s.prior ? s.score.chance * s.prior.score.chance : s.score.chance
    ));
    if (maxChance >= 0.5) return PROBABILITY_COLORS.high;
    if (maxChance >= 0.2) return PROBABILITY_COLORS.medium;
    return PROBABILITY_COLORS.low;
  }, [isDepth1PotentialWinner, isDepth2PotentialWinner, scoringScenarios]);

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      style={style}
      className={`cell${isCurrentWinner ? ' winning' : ''}${isDepth1PotentialWinner ? ' depth-1-potential' : ''}${isDepth2PotentialWinner ? ' depth-2-potential' : ''}${isNonPotential ? ' non-potential' : ''}${showTooltip ? ' hovered' : ''}`}
      onMouseEnter={() => hasScenarios && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}>
      <div className="square">{ownerName}</div>
      {probabilityDotColor && (
        <div className="probability-dot" style={{ backgroundColor: probabilityDotColor }} />
      )}
      {showTooltip && hasScenarios && (
        <div ref={tooltipRef} className={`scenario-tooltip tooltip-${tooltipPosition} tooltip-${tooltipVertical}`}>
          <div className="tooltip-owner">{ownerName || 'Unclaimed'}</div>
          {scoringScenarios.slice(0, 5).map((scenario, i) => {
            const team = scenario.scorer === 'home' ? homeTeam : awayTeam;
            const resultScore = `${scenario.away}–${scenario.home}`;

            if (scenario.prior) {
              const priorTeam = scenario.prior.scorer === 'home' ? homeTeam : awayTeam;
              return (
                <div key={i} className="scenario-item depth-2">
                  <ScoreIcon name={scenario.prior.score.name} iconOnly />
                  <span className="scenario-team">{priorTeam}</span>
                  <span className="scenario-points">+{scenario.prior.score.points}</span>
                  <span className="scenario-arrow">→</span>
                  <ScoreIcon name={scenario.score.name} iconOnly />
                  <span className="scenario-team">{team}</span>
                  <span className="scenario-points">+{scenario.score.points}</span>
                  <span className="scenario-arrow">→</span>
                  <span className="scenario-score">{resultScore}</span>
                </div>
              );
            }
            return (
              <div key={i} className="scenario-item depth-1">
                <ScoreIcon name={scenario.score.name} iconOnly />
                <span className="scenario-team">{team}</span>
                <span className="scenario-points">+{scenario.score.points}</span>
                <span className="scenario-arrow">→</span>
                <span className="scenario-score">{resultScore}</span>
              </div>
            );
          })}
          {scoringScenarios.length > 5 && (
            <div className="scenario-more">
              +{scoringScenarios.length - 5}…
            </div>
          )}
        </div>
      )}
    </button>
  );
}
