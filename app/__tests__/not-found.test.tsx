import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NotFound from '../not-found';

describe('Not Found Page', () => {
  it('renders 404 title', () => {
    render(<NotFound />);

    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(<NotFound />);

    expect(
      screen.getByText(/Sorry, the page you are looking for does not exist/)
    ).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<NotFound />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Variables')).toBeInTheDocument();
  });

  it('renders navigation links with correct href attributes', () => {
    render(<NotFound />);

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Client' })).toHaveAttribute('href', '/client');
    expect(screen.getByRole('link', { name: 'History' })).toHaveAttribute('href', '/history');
    expect(screen.getByRole('link', { name: 'Variables' })).toHaveAttribute('href', '/variables');
  });

  it('renders help text', () => {
    render(<NotFound />);

    expect(
      screen.getByText(/You can go back to the home page or try one of these links/)
    ).toBeInTheDocument();
  });
});
