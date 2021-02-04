import React, { useCallback } from "react";

const baseStyle = {
  outline: "none",

  ":focus": {
    outline: "none",
  },
};

export default function Square({
  id,
  isCurrentWinner,
  ownerColor,
  ownerName,
  claim,
  unclaim,
}) {
  const onClick = useCallback(() => {
    if (ownerColor) {
      unclaim(id);
    } else {
      claim(id);
    }
  }, [claim, unclaim, id, ownerColor]);

  const style = {
    ...baseStyle,
    backgroundColor: ownerColor ? ownerColor : "white",
    boxShadow: isCurrentWinner ? "0  30px rgba(211, 203, 238)" : undefined,
    zIndex: 10,
  };

  return (
    <button onClick={onClick} style={style}>
      <div className="square">{ownerName}</div>
    </button>
  );
}
