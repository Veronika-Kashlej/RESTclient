import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    Suspense: ({
      children,
      fallback,
    }: {
      children: React.ReactNode;
      fallback: React.ReactNode;
    }) => (
      <div data-testid="suspense">
        <div data-testid="fallback">{fallback}</div>
        {children}
      </div>
    ),
  };
});

vi.mock('next/dynamic', () => ({
  default: (
    importFn: () => Promise<unknown>,
    options: { loading: () => React.ReactNode; ssr: boolean }
  ) => {
    const DynamicComponent = () => (
      <div data-testid="dynamic-component">
        <div data-testid="loading">{options.loading()}</div>
        <div data-testid="ssr-disabled">{options.ssr ? 'SSR enabled' : 'SSR disabled'}</div>
      </div>
    );
    return DynamicComponent;
  },
}));

vi.mock('../components/auth/withAuth', () => ({
  default: (Component: React.ComponentType) => {
    const WrappedComponent = (props: Record<string, unknown>) => (
      <div data-testid="with-auth-wrapper">
        <Component {...props} />
      </div>
    );
    return WrappedComponent;
  },
}));

vi.mock('./HistoryComponent', () => ({
  default: () => <div data-testid="history-component">History Component</div>,
}));

import HistoryPage from '../[locale]/history/page';

describe('History Page', () => {
  it('should render with auth wrapper', () => {
    render(<HistoryPage />);

    expect(screen.getByTestId('with-auth-wrapper')).toBeInTheDocument();
  });

  it('should render suspense wrapper', () => {
    render(<HistoryPage />);

    expect(screen.getByTestId('suspense')).toBeInTheDocument();
  });

  it('should render dynamic component with correct configuration', () => {
    render(<HistoryPage />);

    expect(screen.getByTestId('dynamic-component')).toBeInTheDocument();
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading History...');
    expect(screen.getByTestId('ssr-disabled')).toHaveTextContent('SSR disabled');
  });

  it('should render fallback content', () => {
    render(<HistoryPage />);

    expect(screen.getByTestId('fallback')).toHaveTextContent('Loading History...');
  });
});
