import React from 'react';
import './Score.css';
import './Grid.css';

interface Props {
  digit?: string;
  className?: string;
}

export default function Score({ digit, className }: Props) {
  return <div className={`score ${className}`}>{digit}</div>;
}
