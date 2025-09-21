import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SignUp from '../[locale]/sign-up/page';

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
      signUp: 'Sign Up',
      createAccountMessage: 'Create your account to get started.',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      showPassword: 'Show Password',
      hidePassword: 'Hide Password',
      registerButton: 'Register',
      loading: 'Loading...',
      passwordsDoNotMatch: 'Passwords do not match',
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

describe('Sign Up Page', () => {
  it('renders sign up title', () => {
    render(<SignUp />);

    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('renders create account message', () => {
    render(<SignUp />);

    expect(screen.getByText(/Create your account to get started/)).toBeInTheDocument();
  });

  it('renders placeholder content', () => {
    render(<SignUp />);
  });
});
