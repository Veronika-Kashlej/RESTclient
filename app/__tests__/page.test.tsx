import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from '../page';

describe('Home Page', () => {
  it('renders welcome message', () => {
    render(<Home />);

    // expect(screen.getByText('Welcome to Next.js')).toBeInTheDocument();
    expect(screen.getByText(/Postman clone is here/)).toBeInTheDocument();
  });

  it('renders with correct structure', () => {
    render(<Home />);

    expect(screen.getByTestId('app')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
