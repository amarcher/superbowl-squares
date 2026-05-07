import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders a 10x10 grid of squares', () => {
  const { container } = render(<App />);
  const cells = container.querySelectorAll('button.cell');
  expect(cells.length).toBe(100);
});
