import React, { useCallback, useMemo } from "react";

import "./Player.css";

export default function Player({
  id,
  ownedSquares,
  setActive,
  color,
  name,
  isActive,
}) {
  const onClick = useCallback(() => {
    setActive(id);
  }, [setActive, id]);

  const style = useMemo(
    () => ({
      backgroundColor: color,
      boxShadow: isActive ? "black 0px 0px 5pt 1pt" : "none",
    }),
    [color, isActive]
  );

  return (
    <button onClick={onClick} style={style} className="button player">
      <div>
        {name} ({ownedSquares.length})
      </div>
    </button>
  );
}
