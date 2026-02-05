import React from 'react';
import './CompactHeader.css';

interface CompactHeaderProps {
  onShare: () => void;
  onSummary: () => void;
  onShowNext: () => void;
  onUnlock: () => void;
  isLocked: boolean;
}

const CompactHeader: React.FC<CompactHeaderProps> = ({
  onShare,
  onSummary,
  onShowNext,
  onUnlock,
  isLocked,
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
          {isLocked ? 'Show Next' : 'Hide Next'}
        </button>
        <button className="header-btn" onClick={onUnlock}>
          {isLocked ? 'Unlock' : 'Lock'}
        </button>
      </div>
    </div>
  );
};

export default CompactHeader;
