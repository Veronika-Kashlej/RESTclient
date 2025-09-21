import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SignIn from '../[locale]/sign-in/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    pathname: '/',
  }),
  useParams: vi.fn(() => ({ locale: 'en' })),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      signIn: 'Sign In',
      welcomeBackMessage: 'Welcome back! Please sign in to your account.',
      email: 'Email',
      password: 'Password',
      showPassword: 'Show Password',
      hidePassword: 'Hide Password',
      loginButton: 'Login',
      loading: 'Loading...',
    };
    return translations[key] || key;
  }),
}));

vi.mock('../components/authContext/authContext', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    error: null,
    signOut: vi.fn(),
  })),
}));

describe('Sign In Page', () => {
  it('renders sign in title', () => {
    render(<SignIn />);

    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('renders welcome message', () => {
    render(<SignIn />);

    expect(screen.getByText(/Welcome back! Please sign in to your account/)).toBeInTheDocument();
  });
});
