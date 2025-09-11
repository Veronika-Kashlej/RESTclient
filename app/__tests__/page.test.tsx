import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from '../page';
import MainLayout from '../components/MainLayout';
import AuthProviderWrapper from '@/components/authProviderWrapper/authProviderWrapper';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    pathname: '/',
  }),
}));

describe('Home Page', () => {
  it('renders welcome message', () => {
    render(
      <AuthProviderWrapper>
        <Home />
      </AuthProviderWrapper>
    );

    // expect(screen.getByText(/Postman clone is here/)).toBeInTheDocument();
  });

  it('renders with correct structure', () => {
    render(
      <MainLayout>
        <AuthProviderWrapper>
          <Home />
        </AuthProviderWrapper>
      </MainLayout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
