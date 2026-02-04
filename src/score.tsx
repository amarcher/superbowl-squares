import React from 'react';
import './Score.css';
import './Grid.css';

interface Props {
  digit?: string;
  className?: string;
  isActive?: boolean;
}

export default function Score({ digit, className, isActive }: Props) {
  return <div className={`score${isActive ? ` ${className}` : ''}`}>{digit}</div>;
}
