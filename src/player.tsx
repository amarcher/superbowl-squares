import React, { useCallback, useMemo } from 'react';

import './Player.css';

interface Props {
  id?: string;
  ownedSquares?: string[];
  setActive?: (id: number) => void;
  color?: string;
  gradient?: string;
  name?: string;
  isActive?: boolean;
}

export default function Player({
  id,
  ownedSquares,
  setActive,
  color,
  gradient,
  name,
  isActive,
}: Props) {
  const onClick = useCallback(() => {
    setActive?.(parseInt(id || '', 10));
  }, [setActive, id]);

  const style = useMemo(
    () => ({
      background: gradient || color,
      boxShadow: isActive ? 'black 0px 0px 5pt 1pt' : 'none',
    }),
    [gradient, color, isActive],
  );

  return (
    <button onClick={onClick} style={style} className="button player">
      <div>
        {name} ({ownedSquares?.length || 0})
      </div>
    </button>
  );
}
