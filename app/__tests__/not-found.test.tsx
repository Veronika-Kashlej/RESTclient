import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NotFound from '../not-found';

describe('Not Found Page', () => {
  it('renders 404 title', () => {
    render(<NotFound />);

    expect(screen.getByText('404')).toBeInTheDocument();
  });
});
