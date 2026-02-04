import React from 'react';

import './Legend.css';

interface Props {
  x?: string;
  y?: string;
}

export default function Legend({ x, y }: Props) {
  return (
    <div className="legend-corner">
      <div className="x">
        <div className="rotate">{x}</div>
      </div>
      <div className="y">{y}</div>
    </div>
  );
}
