import React from 'react';
import './WinnerDisplay.css';

interface WinnerDisplayProps {
  ownerName: string;
  homeDigit: number;
  awayDigit: number;
  homeTeam: string;
  awayTeam: string;
}

const WinnerDisplay: React.FC<WinnerDisplayProps> = ({
  ownerName,
  homeDigit,
  awayDigit,
  homeTeam,
  awayTeam,
}) => {
  return (
    <div className="winner-display">
      <div className="winner-icon">🏆</div>
      <div className="winner-content">
        <div className="winner-label">Current Winner</div>
        <div className="winner-name">{ownerName}</div>
        <div className="winner-coordinates">
          {homeTeam}-{homeDigit}, {awayTeam}-{awayDigit}
        </div>
      </div>
    </div>
  );
};

export default WinnerDisplay;
