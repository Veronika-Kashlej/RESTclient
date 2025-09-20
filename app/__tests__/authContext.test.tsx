import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../components/authContext/authContext';
import { onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('../firebase/firebase', () => ({
  auth: {},
}));

describe('AuthProvider', () => {
  const mockPush = vi.fn();
  const mockOnAuthStateChanged = vi.mocked(onAuthStateChanged);
  const mockFirebaseSignOut = vi.mocked(firebaseSignOut);

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

  it('should provide initial loading state', () => {
    mockOnAuthStateChanged.mockReturnValue(() => {});

    const TestComponent = () => {
      const { loading } = useAuth();
      return <div>{loading ? 'Loading...' : 'Loaded'}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle user authentication', async () => {
    const mockUser = { uid: 'test-uid', email: 'test@example.com' } as User;
    let authCallback: (user: User | null) => void;

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authCallback = callback as (user: User | null) => void;
      return () => {};
    });

    const TestComponent = () => {
      const { user, loading } = useAuth();
      return <div>{loading ? 'Loading...' : user ? `Welcome ${user.email}` : 'No user'}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await act(async () => {
      authCallback(mockUser);
    });

    await waitFor(() => {
      expect(screen.getByText('Welcome test@example.com')).toBeInTheDocument();
    });
  });

  it('should handle user logout', async () => {
    let authCallback: (user: User | null) => void;

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authCallback = callback as (user: User | null) => void;
      return () => {};
    });

    const TestComponent = () => {
      const { user, loading } = useAuth();
      return <div>{loading ? 'Loading...' : user ? `Welcome ${user.email}` : 'No user'}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      authCallback(null);
    });

    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument();
      expect(mockPush).toHaveBeenCalledWith('/sign-up');
    });
  });

  it('should handle authentication error', async () => {
    const mockError = new Error('Authentication failed');
    let errorCallback: (error: Error) => void;

    mockOnAuthStateChanged.mockImplementation((auth, callback, errorCb) => {
      errorCallback = errorCb as (error: Error) => void;
      return () => {};
    });

    const TestComponent = () => {
      const { error, loading } = useAuth();
      return <div>{loading ? 'Loading...' : error ? `Error: ${error}` : 'No error'}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      errorCallback(mockError);
    });

    await waitFor(() => {
      expect(screen.getByText('Error: Authentication failed')).toBeInTheDocument();
    });
  });

  it('should provide signOut function', async () => {
    const mockUser = { uid: 'test-uid', email: 'test@example.com' } as User;
    let authCallback: (user: User | null) => void;

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authCallback = callback as (user: User | null) => void;
      return () => {};
    });

    mockFirebaseSignOut.mockResolvedValue();

    const TestComponent = () => {
      const { signOut } = useAuth();
      return (
        <button onClick={signOut} data-testid="sign-out-btn">
          Sign Out
        </button>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      authCallback(mockUser);
    });

    const signOutButton = screen.getByTestId('sign-out-btn');
    signOutButton.click();

    await waitFor(() => {
      expect(mockFirebaseSignOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('should set mounted state', () => {
    mockOnAuthStateChanged.mockReturnValue(() => {});

    const TestComponent = () => {
      const { loading } = useAuth();
      return <div>{loading ? 'Loading...' : 'Loaded'}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

describe('useAuth hook', () => {
  it('should throw error when used outside AuthProvider', () => {
    const TestComponent = () => {
      useAuth();
      return <div>Test</div>;
    };

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('should return context when used within AuthProvider', () => {
    vi.mocked(onAuthStateChanged).mockReturnValue(() => {});

    const TestComponent = () => {
      const { loading } = useAuth();
      return <div>{loading ? 'Loading...' : 'Loaded'}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
