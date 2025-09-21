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

vi.mock('./ClientComponent', () => ({
  default: () => <div data-testid="client-component">Client Component</div>,
}));

import ClientPage from '../[locale]/client/page';

describe('Client Page', () => {
  it('should render with auth wrapper', () => {
    render(<ClientPage />);

    expect(screen.getByTestId('with-auth-wrapper')).toBeInTheDocument();
  });

  it('should render suspense wrapper', () => {
    render(<ClientPage />);

    expect(screen.getByTestId('suspense')).toBeInTheDocument();
  });

  it('should render dynamic component with correct configuration', () => {
    render(<ClientPage />);

    expect(screen.getByTestId('dynamic-component')).toBeInTheDocument();
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading REST Client...');
    expect(screen.getByTestId('ssr-disabled')).toHaveTextContent('SSR disabled');
  });

  it('should render fallback content', () => {
    render(<ClientPage />);

    expect(screen.getByTestId('fallback')).toHaveTextContent('Loading REST Client...');
  });
});
