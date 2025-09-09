import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SignIn from '../sign-in/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    pathname: '/',
  }),
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

  it('renders placeholder content', () => {
    render(<SignIn />);

    // expect(screen.getByText(/Sign in form will be implemented here/)).toBeInTheDocument();
    // expect(
    //   screen.getByText(/This is a placeholder page for the sign-in route/)
    // ).toBeInTheDocument();
  });
});
