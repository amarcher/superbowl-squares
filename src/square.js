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
    boxShadow: isCurrentWinner ? "rgb(82 212 0) 0px 0px 5px 5px" : undefined,
    zIndex: isCurrentWinner ? 10 : undefined,
  };

  return (
    <button onClick={onClick} style={style}>
      <div className="square">{ownerName}</div>
    </button>
  );
}
