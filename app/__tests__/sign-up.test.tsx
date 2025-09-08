import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SignUp from '../sign-up/page';

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

    expect(screen.getByText(/Registration form will be implemented here/)).toBeInTheDocument();
    expect(
      screen.getByText(/This is a placeholder page for the sign-up route/)
    ).toBeInTheDocument();
  });
});
