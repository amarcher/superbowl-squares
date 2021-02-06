import React from "react";
import "./Score.css";

export default function Score({ digit, backgroundColor, color }) {
  return (
    <div style={{ backgroundColor, color }} className="score">
      {digit}
    </div>
  );
}
