import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ErrorBoundary from '../components/ErrorBoundary';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('ErrorBoundary Component', () => {
  const consoleSpy = vi.spyOn(console, 'error');

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy.mockImplementation(() => {});
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child Component</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should render error message when error occurs', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should log error and show toast when error occurs', () => {
    const testError = new Error('Test error');
    const ThrowError = () => {
      throw testError;
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should catch errors from nested components', () => {
    const NestedComponent = () => (
      <div>
        <div>Parent</div>
        <div>
          {(() => {
            throw new Error('Nested error');
          })()}
        </div>
      </div>
    );

    render(
      <ErrorBoundary>
        <NestedComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should handle multiple children without errors', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });

  it('should show error boundary for any child that throws', () => {
    const GoodComponent = () => <div data-testid="good">Good Component</div>;
    const BadComponent = () => {
      throw new Error('Bad component error');
    };

    render(
      <ErrorBoundary>
        <GoodComponent />
        <BadComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.queryByTestId('good')).not.toBeInTheDocument();
  });

  it('should reset error state when children change', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };
    const GoodComponent = () => <div data-testid="good">Good Component</div>;

    const { rerender } = render(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('good')).toBeInTheDocument();

    rerender(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should handle non-Error exceptions', () => {
    const ThrowString = () => {
      throw 'String error';
    };

    render(
      <ErrorBoundary>
        <ThrowString />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
