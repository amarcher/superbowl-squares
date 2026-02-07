import React from 'react';
import './CompactHeader.css';

interface CompactHeaderProps {
  onShare: () => void;
  onSummary: () => void;
  onShowNext: () => void;
  onUnlock: () => void;
  showPotentialWinners: boolean;
}

const CompactHeader: React.FC<CompactHeaderProps> = ({
  onShare,
  onSummary,
  onShowNext,
  onUnlock,
  showPotentialWinners,
}) => {
  return (
    <div className="compact-header">
      <h1 className="compact-header-title">SUPERBOWL SQUARES</h1>
      <div className="compact-header-actions">
        <button className="header-btn" onClick={onShare}>
          Share
        </button>
        <button className="header-btn" onClick={onSummary}>
          Summary
        </button>
        <button className="header-btn header-btn-primary" onClick={onShowNext}>
          {showPotentialWinners ? 'Hide Next' : 'Show Next'}
        </button>
        <button className="header-btn" onClick={onUnlock}>
          Unlock
        </button>
      </div>
    </div>
  );
};

export default CompactHeader;
