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
  useTranslations: vi.fn(() => (key: string) => key),
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

    expect(screen.getByText('signUp')).toBeInTheDocument();
  });

  it('renders create account message', () => {
    render(<SignUp />);

    expect(screen.getByText(/Create your account to get started/)).toBeInTheDocument();
  });

  it('renders placeholder content', () => {
    render(<SignUp />);
  });
});
