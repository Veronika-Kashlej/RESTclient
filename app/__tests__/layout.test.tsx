import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RootLayout from '../layout';

describe('RootLayout', () => {
  it('renders with correct HTML structure', () => {
    render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );

    expect(document.documentElement).toHaveAttribute('lang', 'en');
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders MainLayout component', () => {
    render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
  });
});
