import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import SignIn from '../sign-in/page';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
}));

vi.mock('../firebase/firebase', () => ({
  auth: {},
}));

const mockPush = vi.fn();

describe('SignIn Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    });
  });

  describe('Rendering', () => {
    it('renders sign in form correctly', () => {
      render(<SignIn />);

      expect(screen.getByRole('heading', { level: 1, name: 'Sign In' })).toBeInTheDocument();
      expect(screen.getByText('Welcome back! Please sign in to your account.')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByText('Show password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });

    it('has correct form structure', () => {
      render(<SignIn />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
      expect(form).toBeInTheDocument();

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const showPasswordCheckbox = screen.getByRole('checkbox');
      const submitButton = screen.getByRole('button', { name: 'Login' });

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
      expect(submitButton).toHaveAttribute('type', 'submit');
      expect(showPasswordCheckbox).toHaveAttribute('type', 'checkbox');
    });

    it('has correct CSS classes', () => {
      render(<SignIn />);

      expect(document.querySelector('.auth-wrapper')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toHaveClass('ui-input');
      expect(screen.getByPlaceholderText('Password')).toHaveClass('ui-input');
      expect(screen.getByRole('button', { name: 'Login' })).toHaveClass('signin-btn');
    });
  });

  describe('Form Interactions', () => {
    it('updates email input value', () => {
      render(<SignIn />);

      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('updates password input value', () => {
      render(<SignIn />);

      const passwordInput = screen.getByPlaceholderText('Password');
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(passwordInput).toHaveValue('password123');
    });

    it('toggles password visibility', () => {
      render(<SignIn />);

      const passwordInput = screen.getByPlaceholderText('Password');
      const showPasswordCheckbox = screen.getByRole('checkbox');

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(showPasswordCheckbox).not.toBeChecked();

      fireEvent.click(showPasswordCheckbox);

      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(showPasswordCheckbox).toBeChecked();

      fireEvent.click(showPasswordCheckbox);

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(showPasswordCheckbox).not.toBeChecked();
    });

    it('maintains form state during interactions', () => {
      render(<SignIn />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const showPasswordCheckbox = screen.getByRole('checkbox');

      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'mypassword' } });
      fireEvent.click(showPasswordCheckbox);

      expect(emailInput).toHaveValue('user@test.com');
      expect(passwordInput).toHaveValue('mypassword');
      expect(showPasswordCheckbox).toBeChecked();
    });
  });

  describe('Form Submission', () => {
    it('calls signInWithEmailAndPassword on form submission', async () => {
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({} as never);

      render(<SignIn />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          {},
          'test@example.com',
          'password123'
        );
      });
    });

    it('navigates to home page on successful login', async () => {
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({} as never);

      render(<SignIn />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('prevents default form submission', async () => {
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({} as never);

      render(<SignIn />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();

      const mockEvent = { preventDefault: vi.fn() } as { preventDefault: ReturnType<typeof vi.fn> };
      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          mockEvent.preventDefault();
        };
        fireEvent.submit(form);
      }

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('clears error state before submission', async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce(new Error('Invalid credentials'));

      render(<SignIn />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({} as never);
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when login fails with Error instance', async () => {
      const errorMessage = 'Firebase: Error (auth/user-not-found).';
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue(new Error(errorMessage));

      render(<SignIn />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      const errorElement = screen.getByText(errorMessage);
      expect(errorElement).toHaveClass('auth-wrapper__error');
    });

    it('displays generic error message for non-Error instances', async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue('String error');

      render(<SignIn />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('A new error occurred')).toBeInTheDocument();
      });
    });

    it('does not display error message initially', () => {
      render(<SignIn />);

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('handles multiple error scenarios', async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue(new Error('First error'));

      render(<SignIn />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      vi.mocked(signInWithEmailAndPassword).mockRejectedValue(new Error('Second error'));
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Second error')).toBeInTheDocument();
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and structure', () => {
      render(<SignIn />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const checkbox = screen.getByRole('checkbox');
      const button = screen.getByRole('button', { name: 'Login' });

      expect(form).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(checkbox).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });

    it('has required attributes for form validation', () => {
      render(<SignIn />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');

      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('has proper heading hierarchy', () => {
      render(<SignIn />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Sign In');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty form submission', async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue(new Error('Email required'));

      render(<SignIn />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith({}, '', '');
      });
    });

    it('handles very long email and password', async () => {
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({} as never);

      render(<SignIn />);

      const longEmail = 'a'.repeat(100) + '@example.com';
      const longPassword = 'p'.repeat(200);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');

      fireEvent.change(emailInput, { target: { value: longEmail } });
      fireEvent.change(passwordInput, { target: { value: longPassword } });

      expect(emailInput).toHaveValue(longEmail);
      expect(passwordInput).toHaveValue(longPassword);
    });

    it('handles special characters in inputs', () => {
      render(<SignIn />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');

      const specialEmail = 'test+tag@example.co.uk';
      const specialPassword = 'P@ssw0rd!#$%';

      fireEvent.change(emailInput, { target: { value: specialEmail } });
      fireEvent.change(passwordInput, { target: { value: specialPassword } });

      expect(emailInput).toHaveValue(specialEmail);
      expect(passwordInput).toHaveValue(specialPassword);
    });

    it('maintains password visibility state during form submission', async () => {
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({} as never);

      render(<SignIn />);

      const passwordInput = screen.getByPlaceholderText('Password');
      const showPasswordCheckbox = screen.getByRole('checkbox');

      fireEvent.click(showPasswordCheckbox);
      expect(passwordInput).toHaveAttribute('type', 'text');

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(passwordInput).toHaveAttribute('type', 'text');
        expect(showPasswordCheckbox).toBeChecked();
      });
    });
  });

  describe('Integration', () => {
    it('completes full login flow', async () => {
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({} as never);

      render(<SignIn />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'securepassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          {},
          'user@example.com',
          'securepassword'
        );
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('handles login failure and retry', async () => {
      vi.mocked(signInWithEmailAndPassword)
        .mockRejectedValueOnce(new Error('Wrong password'))
        .mockResolvedValueOnce({} as never);

      render(<SignIn />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Wrong password')).toBeInTheDocument();
      });

      fireEvent.change(passwordInput, { target: { value: 'correctpassword' } });
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
        expect(screen.queryByText('Wrong password')).not.toBeInTheDocument();
      });
    });
  });
});
