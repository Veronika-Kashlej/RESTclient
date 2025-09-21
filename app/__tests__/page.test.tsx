import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from '../[locale]/page';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/authContext/authContext';
import { doc, getDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  redirect: vi.fn(),
  useParams: vi.fn(() => ({ locale: 'en' })),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      loading: 'Loading...',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      signOut: 'Sign Out',
    };
    return translations[key] || key;
  }),
}));

vi.mock('../components/authContext/authContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
}));

vi.mock('../firebase/firebase', () => ({
  db: {},
}));

vi.mock('../page.module.scss', () => ({
  default: {
    'home-page': 'home-page',
  },
}));

describe('Home Component', () => {
  const mockPush = vi.fn();
  const mockSignOut = vi.fn();
  const mockGetDoc = vi.mocked(getDoc);
  const mockDoc = vi.mocked(doc);

  const createMockUser = (email: string): User => ({
    email,
    emailVerified: false,
    isAnonymous: false,
    metadata: {} as never,
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: vi.fn(),
    getIdToken: vi.fn(),
    getIdTokenResult: vi.fn(),
    reload: vi.fn(),
    toJSON: vi.fn(),
    displayName: null,
    phoneNumber: null,
    photoURL: null,
    providerId: '',
    uid: 'test-uid',
  });

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

    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signOut: mockSignOut,
    });

    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should show loading when auth is loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
      error: null,
      signOut: mockSignOut,
    });

    render(<Home />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show sign in and sign up links when user is not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signOut: mockSignOut,
    });

    render(<Home />);

    expect(screen.getByText('Welcome!')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('should show auth error when present', async () => {
    const authError = 'Authentication failed';
    vi.mocked(useAuth).mockReturnValue({
      user: createMockUser('test@example.com'),
      loading: false,
      error: authError,
      signOut: mockSignOut,
    });

    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ message: 'Hello from Firebase!' }),
    } as never);

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(`Error: ${authError}`)).toBeInTheDocument();
    });
  });

  it('should show loading when fetching Firebase data', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: createMockUser('test@example.com'),
      loading: false,
      error: null,
      signOut: mockSignOut,
    });

    mockGetDoc.mockImplementation(() => new Promise(() => {}));

    render(<Home />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display welcome message and user email when authenticated', async () => {
    const user = createMockUser('test@example.com');
    vi.mocked(useAuth).mockReturnValue({
      user,
      loading: false,
      error: null,
      signOut: mockSignOut,
    });

    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ message: 'Hello from Firebase!' }),
    } as never);

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Postman clone is here')).toBeInTheDocument();
    });

    expect(screen.getByText('Welcome back, test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Hello from Firebase!')).toBeInTheDocument();
  });

  it('should show Firebase error when document fetch fails', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: createMockUser('test@example.com'),
      loading: false,
      error: null,
      signOut: mockSignOut,
    });

    mockGetDoc.mockRejectedValue(new Error('Firebase error'));

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch document')).toBeInTheDocument();
    });
  });

  it('should show error when document does not exist', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: createMockUser('test@example.com'),
      loading: false,
      error: null,
      signOut: mockSignOut,
    });

    mockGetDoc.mockResolvedValue({
      exists: () => false,
    } as never);

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Error: No such document!')).toBeInTheDocument();
    });
  });

  it('should call signOut when logout button is clicked', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: createMockUser('test@example.com'),
      loading: false,
      error: null,
      signOut: mockSignOut,
    });

    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ message: 'Hello from Firebase!' }),
    } as never);

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Postman clone is here')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Sign Out');
    fireEvent.click(logoutButton);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('should call Firebase with correct parameters', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: createMockUser('test@example.com'),
      loading: false,
      error: null,
      signOut: mockSignOut,
    });

    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ message: 'Hello from Firebase!' }),
    } as never);

    render(<Home />);

    await waitFor(() => {
      expect(mockDoc).toHaveBeenCalledWith({}, 'testCollection', 'testDoc');
      expect(mockGetDoc).toHaveBeenCalled();
    });
  });

  it('should log error to console when Firebase fetch fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error');
    const firebaseError = new Error('Firebase connection failed');

    vi.mocked(useAuth).mockReturnValue({
      user: createMockUser('test@example.com'),
      loading: false,
      error: null,
      signOut: mockSignOut,
    });

    mockGetDoc.mockRejectedValue(firebaseError);

    render(<Home />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(firebaseError);
    });
  });
});
