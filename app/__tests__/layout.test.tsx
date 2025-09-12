import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthProvider } from '@/components/authContext/authContext';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <main data-testid="app">{children}</main>
    </AuthProvider>
  );
}

describe('TestWrapper', () => {
  it('renders children and main', () => {
    render(
      <TestWrapper>
        <div>Test content</div>
      </TestWrapper>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByTestId('app')).toBeInTheDocument();
  });
});
