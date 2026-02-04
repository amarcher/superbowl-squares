import React from 'react';

const Football = () => (
  <svg viewBox="0 0 24 16" width="20" height="13">
    <path
      d="M1,8 Q6,1 12,1 Q18,1 23,8 Q18,15 12,15 Q6,15 1,8Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <line x1="9.5" y1="5.5" x2="14.5" y2="5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="11" y1="4"   x2="11" y2="7"   stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
    <line x1="12" y1="4"   x2="12" y2="7"   stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
    <line x1="13" y1="4"   x2="13" y2="7"   stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
  </svg>
);

const GoalPost = () => (
  <svg viewBox="0 0 22 18" width="18" height="15">
    <line x1="4"  y1="1"  x2="4"  y2="7"  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="18" y1="1"  x2="18" y2="7"  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="3"  y1="7"  x2="19" y2="7"  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="8"  y1="7"  x2="11" y2="17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="14" y1="7"  x2="11" y2="17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const Shield = () => (
  <svg viewBox="0 0 18 22" width="14" height="17">
    <path
      d="M9,1 L17,5 L17,12 C17,17 13.5,20 9,21 C4.5,20 1,17 1,12 L1,5 Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const PLAYS: Record<string, { Icon: () => JSX.Element; label: string }> = {
  'touchdown':                      { Icon: Football,  label: 'TD' },
  'touchdown + extra 2 points':     { Icon: Football,  label: 'TD + 2pt' },
  'touchdown + missed kick':        { Icon: Football,  label: 'TD – missed PAT' },
  'field goal':                     { Icon: GoalPost,  label: 'FG' },
  'safety':                         { Icon: Shield,    label: 'Safety' },
};

export default function ScoreIcon({ name }: { name: string }) {
  const play = PLAYS[name];
  if (!play) {
    return <span className="action-type">{name}</span>;
  }
  const { Icon, label } = play;
  return (
    <span className="action-type">
      <span className="score-icon"><Icon /></span>
      {label}
    </span>
  );
}
