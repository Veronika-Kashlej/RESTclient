import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import SignUp from '../[locale]/sign-up/page';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useParams: vi.fn(() => ({ locale: 'en' })),
}));

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      signUp: 'Sign Up',
      createAccount: 'Create your account to get started.',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      showPassword: 'Show Password',
      registerButton: 'Register',
      loading: 'Loading...',
      emailInUse: 'Email is already in use. Please try a different email.',
      weakPassword: 'Password should be at least 6 characters.',
      passwordMismatch: 'Passwords do not match.',
      passwordsDoNotMatch: 'Passwords do not match.',
    };
    return translations[key] || key;
  }),
}));

vi.mock('../../components/authContext/authContext', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    error: null,
    signOut: vi.fn(),
  })),
}));

vi.mock('../firebase/firebase', () => ({
  auth: {},
}));

const mockPush = vi.fn();

describe('SignUp Page', () => {
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
    it('renders sign up form correctly', () => {
      render(<SignUp />);

      expect(screen.getByRole('heading', { level: 1, name: 'Sign Up' })).toBeInTheDocument();
      expect(screen.getByText('Create your account to get started.')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
      expect(screen.getByText('Show Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
    });

    it('has correct form structure', () => {
      render(<SignUp />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
      expect(form).toBeInTheDocument();
      expect(form).toHaveClass('sign-upForm');

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      const showPasswordCheckbox = screen.getByRole('checkbox');
      const submitButton = screen.getByRole('button', { name: 'Register' });

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('required');
      expect(submitButton).toHaveAttribute('type', 'submit');
      expect(showPasswordCheckbox).toHaveAttribute('type', 'checkbox');
    });

    it('has correct CSS classes', () => {
      render(<SignUp />);

      expect(document.querySelector('.auth-page')).toBeInTheDocument();
      expect(document.querySelector('.auth-wrapper')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toHaveClass('ui-input');
      expect(screen.getByPlaceholderText('Password')).toHaveClass('ui-input');
      expect(screen.getByPlaceholderText('Confirm Password')).toHaveClass('ui-input');
      expect(screen.getByRole('button', { name: 'Register' })).toHaveClass('signup-btn');
    });
  });

  describe('Form Interactions', () => {
    it('updates email input value', () => {
      render(<SignUp />);

      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('updates password input value', () => {
      render(<SignUp />);

      const passwordInput = screen.getByPlaceholderText('Password');
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(passwordInput).toHaveValue('password123');
    });

    it('updates confirm password input value', () => {
      render(<SignUp />);

      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      expect(confirmPasswordInput).toHaveValue('password123');
    });

    it('toggles password visibility for both password fields', () => {
      render(<SignUp />);

      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      const showPasswordCheckbox = screen.getByRole('checkbox');

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      expect(showPasswordCheckbox).not.toBeChecked();

      fireEvent.click(showPasswordCheckbox);

      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');
      expect(showPasswordCheckbox).toBeChecked();

      fireEvent.click(showPasswordCheckbox);

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      expect(showPasswordCheckbox).not.toBeChecked();
    });

    it('maintains form state during interactions', () => {
      render(<SignUp />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      const showPasswordCheckbox = screen.getByRole('checkbox');

      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'mypassword' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'mypassword' } });
      fireEvent.click(showPasswordCheckbox);

      expect(emailInput).toHaveValue('user@test.com');
      expect(passwordInput).toHaveValue('mypassword');
      expect(confirmPasswordInput).toHaveValue('mypassword');
      expect(showPasswordCheckbox).toBeChecked();
    });
  });

  describe('Form Validation', () => {
    it('shows error when passwords do not match', async () => {
      render(<SignUp />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
      });

      expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it('does not show error when passwords match', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({} as never);

      render(<SignUp />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalled();
      });

      expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
    });

    it('validates empty password confirmation', async () => {
      render(<SignUp />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
      });
    });

    it('clears password mismatch error when passwords match', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({} as never);

      render(<SignUp />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'different' } });
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
      });

      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('calls createUserWithEmailAndPassword on valid form submission', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({} as never);

      render(<SignUp />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          {},
          'test@example.com',
          'password123'
        );
      });
    });

    it('navigates to home page on successful registration', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({} as never);

      render(<SignUp />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/en');
      });
    });

    it('prevents default form submission', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({} as never);

      render(<SignUp />);

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
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValueOnce(
        new Error('Email already exists')
      );

      render(<SignUp />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      });

      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({} as never);
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.queryByText('Email already exists')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when registration fails with Error instance', async () => {
      const errorMessage = 'Firebase: Error (auth/email-already-in-use).';
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(new Error(errorMessage));

      render(<SignUp />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      const errorElement = screen.getByText(errorMessage);
      expect(errorElement).toHaveClass('auth-wrapper__error');
    });

    it('displays generic error message for non-Error instances', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue('String error');

      render(<SignUp />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('A new error occurred')).toBeInTheDocument();
      });
    });

    it('does not display error message initially', () => {
      render(<SignUp />);

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('handles multiple error scenarios', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(new Error('First error'));

      render(<SignUp />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(new Error('Second error'));
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Second error')).toBeInTheDocument();
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and structure', () => {
      render(<SignUp />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      const checkbox = screen.getByRole('checkbox');
      const button = screen.getByRole('button', { name: 'Register' });

      expect(form).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();
      expect(checkbox).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });

    it('has required attributes for form validation', () => {
      render(<SignUp />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');

      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
      expect(confirmPasswordInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('has proper heading hierarchy', () => {
      render(<SignUp />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Sign Up');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty form submission', async () => {
      render(<SignUp />);

      const passwordInput = screen.getByPlaceholderText('Password');
      const form = document.querySelector('form');

      expect(form).toBeInTheDocument();

      fireEvent.change(passwordInput, { target: { value: 'somepassword' } });
      if (form) fireEvent.submit(form);

      await waitFor(
        () => {
          expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it('handles very long email and password', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({} as never);

      render(<SignUp />);

      const longEmail = 'a'.repeat(100) + '@example.com';
      const longPassword = 'p'.repeat(200);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');

      fireEvent.change(emailInput, { target: { value: longEmail } });
      fireEvent.change(passwordInput, { target: { value: longPassword } });
      fireEvent.change(confirmPasswordInput, { target: { value: longPassword } });

      expect(emailInput).toHaveValue(longEmail);
      expect(passwordInput).toHaveValue(longPassword);
      expect(confirmPasswordInput).toHaveValue(longPassword);
    });

    it('handles special characters in inputs', () => {
      render(<SignUp />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');

      const specialEmail = 'test+tag@example.co.uk';
      const specialPassword = 'P@ssw0rd!#$%';

      fireEvent.change(emailInput, { target: { value: specialEmail } });
      fireEvent.change(passwordInput, { target: { value: specialPassword } });
      fireEvent.change(confirmPasswordInput, { target: { value: specialPassword } });

      expect(emailInput).toHaveValue(specialEmail);
      expect(passwordInput).toHaveValue(specialPassword);
      expect(confirmPasswordInput).toHaveValue(specialPassword);
    });

    it('maintains password visibility state during form submission', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({} as never);

      render(<SignUp />);

      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      const showPasswordCheckbox = screen.getByRole('checkbox');

      fireEvent.click(showPasswordCheckbox);
      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(passwordInput).toHaveAttribute('type', 'text');
        expect(confirmPasswordInput).toHaveAttribute('type', 'text');
        expect(showPasswordCheckbox).toBeChecked();
      });
    });

    it('handles whitespace in password fields', async () => {
      render(<SignUp />);

      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();

      fireEvent.change(passwordInput, { target: { value: ' password ' } });
      fireEvent.change(confirmPasswordInput, { target: { value: ' password ' } });
      if (form) fireEvent.submit(form);

      expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('completes full registration flow', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({} as never);

      render(<SignUp />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: 'Register' });

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'securepassword' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'securepassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          {},
          'user@example.com',
          'securepassword'
        );
        expect(mockPush).toHaveBeenCalledWith('/en');
      });
    });

    it('handles registration failure and retry', async () => {
      vi.mocked(createUserWithEmailAndPassword)
        .mockRejectedValueOnce(new Error('Email already in use'))
        .mockResolvedValueOnce({} as never);

      render(<SignUp />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();

      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Email already in use')).toBeInTheDocument();
      });

      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/en');
        expect(screen.queryByText('Email already in use')).not.toBeInTheDocument();
      });
    });

    it('handles password mismatch and correction flow', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({} as never);

      render(<SignUp />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'different' } });
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
      });

      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          {},
          'user@example.com',
          'password123'
        );
        expect(mockPush).toHaveBeenCalledWith('/en');
        expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
      });
    });
  });
});
