import React from 'react';
import './Score.css';
import './Grid.css';

export default function Score({ digit, className }) {
  return <div className={`score ${className}`}>{digit}</div>;
}
