import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dashboard', () => {
  render(<App />);
  const addButton = screen.getByLabelText(/添加卡片/i);
  expect(addButton).toBeInTheDocument();
});
