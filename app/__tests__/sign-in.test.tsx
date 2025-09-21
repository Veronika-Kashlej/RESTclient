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
  useTranslations: vi.fn(() => (key: string) => key),
}));

describe('Sign In Page', () => {
  it('renders sign in title', () => {
    render(<SignIn />);

    expect(screen.getByText('signIn')).toBeInTheDocument();
  });

  it('renders welcome message', () => {
    render(<SignIn />);

    expect(screen.getByText(/Welcome back! Please sign in to your account/)).toBeInTheDocument();
  });
});
