import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import withAuth from '../components/auth/withAuth';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('../firebase/firebase', () => ({
  auth: {},
}));

describe('withAuth HOC', () => {
  const mockPush = vi.fn();
  const mockOnAuthStateChanged = vi.mocked(onAuthStateChanged);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    } as never);
  });

  it('should show loading state initially', () => {
    mockOnAuthStateChanged.mockReturnValue(() => {});

    const TestComponent = () => <div data-testid="test-component">Test Component</div>;
    const AuthenticatedComponent = withAuth(TestComponent);

    render(<AuthenticatedComponent />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
  });

  it('should render component when user is authenticated', async () => {
    const mockUser = { uid: 'test-uid', email: 'test@example.com' } as User;
    let authCallback: (user: User | null) => void;

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authCallback = callback as (user: User | null) => void;
      return () => {};
    });

    const TestComponent = () => <div data-testid="test-component">Test Component</div>;
    const AuthenticatedComponent = withAuth(TestComponent);

    render(<AuthenticatedComponent />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      authCallback(mockUser);
    });

    await waitFor(() => {
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
      expect(screen.getByText('Test Component')).toBeInTheDocument();
    });
  });

  it('should redirect to sign-in when user is not authenticated', async () => {
    let authCallback: (user: User | null) => void;

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authCallback = callback as (user: User | null) => void;
      return () => {};
    });

    const TestComponent = () => <div data-testid="test-component">Test Component</div>;
    const AuthenticatedComponent = withAuth(TestComponent);

    render(<AuthenticatedComponent />);

    await waitFor(() => {
      authCallback(null);
    });

    await waitFor(() => {
      expect(screen.getByText('Redirecting to sign in...')).toBeInTheDocument();
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('should pass props to wrapped component', async () => {
    const mockUser = { uid: 'test-uid', email: 'test@example.com' } as User;
    let authCallback: (user: User | null) => void;

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authCallback = callback as (user: User | null) => void;
      return () => {};
    });

    interface TestProps {
      title: string;
      count: number;
    }

    const TestComponent = ({ title, count }: TestProps) => (
      <div data-testid="test-component">
        {title} - {count}
      </div>
    );

    const AuthenticatedComponent = withAuth(TestComponent);

    render(<AuthenticatedComponent title="Test Title" count={42} />);

    await waitFor(() => {
      authCallback(mockUser);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Title - 42')).toBeInTheDocument();
    });
  });

  it('should clean up auth listener on unmount', () => {
    const unsubscribe = vi.fn();
    mockOnAuthStateChanged.mockReturnValue(unsubscribe);

    const TestComponent = () => <div data-testid="test-component">Test Component</div>;
    const AuthenticatedComponent = withAuth(TestComponent);

    const { unmount } = render(<AuthenticatedComponent />);

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it('should handle multiple prop types', async () => {
    const mockUser = { uid: 'test-uid', email: 'test@example.com' } as User;
    let authCallback: (user: User | null) => void;

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authCallback = callback as (user: User | null) => void;
      return () => {};
    });

    interface ComplexProps {
      stringProp: string;
      numberProp: number;
      booleanProp: boolean;
      objectProp: { key: string };
    }

    const TestComponent = ({ stringProp, numberProp, booleanProp, objectProp }: ComplexProps) => (
      <div data-testid="test-component">
        {stringProp}-{numberProp}-{booleanProp.toString()}-{objectProp.key}
      </div>
    );

    const AuthenticatedComponent = withAuth(TestComponent);

    const props = {
      stringProp: 'test',
      numberProp: 123,
      booleanProp: true,
      objectProp: { key: 'value' },
    };

    render(<AuthenticatedComponent {...props} />);

    await waitFor(() => {
      authCallback(mockUser);
    });

    await waitFor(() => {
      expect(screen.getByText('test-123-true-value')).toBeInTheDocument();
    });
  });
});
