import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SignIn from '../sign-in/page';

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

    expect(screen.getByText(/Sign in form will be implemented here/)).toBeInTheDocument();
    expect(
      screen.getByText(/This is a placeholder page for the sign-in route/)
    ).toBeInTheDocument();
  });
});
