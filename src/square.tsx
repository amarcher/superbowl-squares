import React, { useCallback, useMemo } from 'react';

import './Square.css';

interface Props {
  id: string;
  isCurrentWinner?: boolean;
  ownerColor?: string;
  ownerName?: string;
  claim: (id: string) => void;
  unclaim: (id: string) => void;
}

export default function Square({
  id,
  isCurrentWinner,
  ownerColor,
  ownerName,
  claim,
  unclaim,
}: Props) {
  const onClick = useCallback(() => {
    if (ownerColor) {
      unclaim(id);
    } else {
      claim(id);
    }
  }, [claim, unclaim, id, ownerColor]);

  const style = useMemo(
    () => ({
      backgroundColor: ownerColor ? ownerColor : 'white',
    }),
    [ownerColor],
  );

  return (
    <button
      onClick={onClick}
      style={style}
      className={`cell${isCurrentWinner ? ' winning' : ''}`}>
      <div className="square">{ownerName}</div>
    </button>
  );
}
