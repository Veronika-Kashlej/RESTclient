import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import About from '../about/page';

describe('About Page', () => {
  it('renders about title', () => {
    render(<About />);

    expect(screen.getByText('About Page')).toBeInTheDocument();
  });

  it('renders test message', () => {
    render(<About />);

    expect(
      screen.getByText(/This is a test page to verify that Layout works on all pages/)
    ).toBeInTheDocument();
  });

  it('renders layout verification message', () => {
    render(<About />);

    expect(
      screen.getByText(/You should see Header and Footer on this page too/)
    ).toBeInTheDocument();
  });

  it('renders with correct heading structure', () => {
    render(<About />);

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('About Page');
  });
});
