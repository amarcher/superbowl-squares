import React from "react";

import "./Legend.css";

export default function Legend({ x, y }) {
  return (
    <div className="container">
      <div className="x">
        <div className="rotate">{x}</div>
      </div>
      <div className="y">{y}</div>
    </div>
  );
}
