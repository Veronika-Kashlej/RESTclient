import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Client from '../client/page';

describe('Client Page', () => {
  it('renders client title', () => {
    render(<Client />);

    expect(screen.getByText('REST Client')).toBeInTheDocument();
  });

  it('renders client description', () => {
    render(<Client />);

    expect(screen.getByText(/Test your REST APIs with our powerful client/)).toBeInTheDocument();
  });

  it('renders placeholder content', () => {
    render(<Client />);

    expect(screen.getByText(/API testing interface will be implemented here/)).toBeInTheDocument();
    expect(screen.getByText(/This is a placeholder page for the client route/)).toBeInTheDocument();
  });
});
