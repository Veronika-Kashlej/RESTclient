import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Navigation from '../components/Navigation';

describe('Navigation Component', () => {
  it('renders navigation with correct test id', () => {
    render(<Navigation />);

    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    render(<Navigation />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Variables')).toBeInTheDocument();
  });

  it('renders navigation links with correct href attributes', () => {
    render(<Navigation />);

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Client' })).toHaveAttribute('href', '/client');
    expect(screen.getByRole('link', { name: 'History' })).toHaveAttribute('href', '/history');
    expect(screen.getByRole('link', { name: 'Variables' })).toHaveAttribute('href', '/variables');
  });

  it('renders navigation list structure', () => {
    render(<Navigation />);

    const navList = screen.getByRole('list');
    expect(navList).toBeInTheDocument();
    expect(navList).toHaveClass('navigation__list');

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(4);
  });
});
