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
      boxShadow: isCurrentWinner ? 'rgb(82 212 0) 0px 0px 5px 5px' : undefined,
      zIndex: isCurrentWinner ? 0 : undefined,
    }),
    [ownerColor, isCurrentWinner],
  );

  return (
    <button onClick={onClick} style={style} className="cell">
      <div className="square">{ownerName}</div>
    </button>
  );
}
