import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AuthProviderWrapper from '../components/authProviderWrapper/authProviderWrapper';

vi.mock('../components/authContext/authContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

describe('AuthProviderWrapper Component', () => {
  it('should render AuthProvider with children', () => {
    render(
      <AuthProviderWrapper>
        <div data-testid="child">Child Content</div>
      </AuthProviderWrapper>
    );

    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should render multiple children', () => {
    render(
      <AuthProviderWrapper>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </AuthProviderWrapper>
    );

    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });

  it('should render without children', () => {
    render(<AuthProviderWrapper>{null}</AuthProviderWrapper>);

    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  });

  it('should render with empty children', () => {
    render(<AuthProviderWrapper>{undefined}</AuthProviderWrapper>);

    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  });

  it('should pass children to AuthProvider', () => {
    const TestChild = () => <div data-testid="test-child">Test Child</div>;

    render(
      <AuthProviderWrapper>
        <TestChild />
      </AuthProviderWrapper>
    );

    const authProvider = screen.getByTestId('auth-provider');
    const testChild = screen.getByTestId('test-child');

    expect(authProvider).toContainElement(testChild);
  });
});
