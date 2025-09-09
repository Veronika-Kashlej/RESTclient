import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ClientComponent from '../client/ClientComponent';

describe('Client Component', () => {
  it('renders client title', () => {
    render(<ClientComponent />);

    expect(screen.getByText('REST Client')).toBeInTheDocument();
  });

  it('renders client description', () => {
    render(<ClientComponent />);

    expect(screen.getByText(/Test your REST APIs with our powerful client/)).toBeInTheDocument();
  });

  it('renders method selector', () => {
    render(<ClientComponent />);

    expect(screen.getByText('HTTP Method:')).toBeInTheDocument();
    expect(screen.getByTestId('method-selector-button')).toBeInTheDocument();
    expect(screen.getByText('GET')).toBeInTheDocument();
  });
});
