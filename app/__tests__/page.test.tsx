import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from '../page';
import MainLayout from '../components/MainLayout';

describe('Home Page', () => {
  it('renders welcome message', () => {
    render(<Home />);

    expect(screen.getByText(/Postman clone is here/)).toBeInTheDocument();
  });

  it('renders with correct structure', () => {
    render(
      <MainLayout>
        <Home />
      </MainLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
