import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Error from '../error';

import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock('../error.module.css', () => ({
  default: {
    container: 'error-container',
    content: 'error-content',
    title: 'error-title',
    button: 'error-button',
  },
}));

describe('Error Component', () => {
  const mockError = { name: 'Error', message: 'Test error' } as Error;
  const mockReset = vi.fn();
  const mockToast = vi.mocked(toast);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should render error message and reset button', () => {
    render(<Error error={mockError} reset={mockReset} />);

    expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should call reset function when button is clicked', () => {
    render(<Error error={mockError} reset={mockReset} />);

    const resetButton = screen.getByText('Try again');
    fireEvent.click(resetButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('should log error to console on mount', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    render(<Error error={mockError} reset={mockReset} />);

    expect(consoleSpy).toHaveBeenCalledWith(mockError);
  });

  it('should show toast error message on mount', () => {
    render(<Error error={mockError} reset={mockReset} />);

    expect(mockToast.error).toHaveBeenCalledWith('Application error occurred');
  });

  it('should apply correct CSS classes', () => {
    render(<Error error={mockError} reset={mockReset} />);

    const container = screen.getByText('Something went wrong!').closest('div')?.parentElement;
    expect(container).toHaveClass('error-container');
  });

  it('should handle error with digest property', () => {
    const errorWithDigest = {
      name: 'Error',
      message: 'Test error',
      digest: 'test-digest-123',
    } as Error & { digest?: string };

    render(<Error error={errorWithDigest} reset={mockReset} />);

    expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
    expect(mockToast.error).toHaveBeenCalledWith('Application error occurred');
  });

  it('should call toast.error and console.error only once per render', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    render(<Error error={mockError} reset={mockReset} />);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(mockToast.error).toHaveBeenCalledTimes(1);
  });
});
