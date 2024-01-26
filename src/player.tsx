import React, { useCallback, useMemo } from 'react';

import './Player.css';
import Square from './types/square';

interface Props {
  id?: string;
  ownedSquares?: string[];
  setActive?: (id: number) => void;
  color?: string;
  name?: string;
  isActive?: boolean;
}

export default function Player({
  id,
  ownedSquares,
  setActive,
  color,
  name,
  isActive,
}: Props) {
  const onClick = useCallback(() => {
    setActive?.(parseInt(id || '', 10));
  }, [setActive, id]);

  const style = useMemo(
    () => ({
      backgroundColor: color,
      boxShadow: isActive ? 'black 0px 0px 5pt 1pt' : 'none',
    }),
    [color, isActive],
  );

  return (
    <button onClick={onClick} style={style} className="button player">
      <div>
        {name} ({ownedSquares?.length || 0})
      </div>
    </button>
  );
}
