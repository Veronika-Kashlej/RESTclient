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

vi.mock('./VariablesComponent', () => ({
  default: () => <div data-testid="variables-component">Variables Component</div>,
}));

import VariablesPage from '../[locale]/variables/page';

describe('Variables Page', () => {
  it('should render with auth wrapper', () => {
    render(<VariablesPage />);

    expect(screen.getByTestId('with-auth-wrapper')).toBeInTheDocument();
  });

  it('should render suspense wrapper', () => {
    render(<VariablesPage />);

    expect(screen.getByTestId('suspense')).toBeInTheDocument();
  });

  it('should render dynamic component with correct configuration', () => {
    render(<VariablesPage />);

    expect(screen.getByTestId('dynamic-component')).toBeInTheDocument();
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading Variables...');
    expect(screen.getByTestId('ssr-disabled')).toHaveTextContent('SSR disabled');
  });

  it('should render fallback content', () => {
    render(<VariablesPage />);

    expect(screen.getByTestId('fallback')).toHaveTextContent('Loading Variables...');
  });
});
