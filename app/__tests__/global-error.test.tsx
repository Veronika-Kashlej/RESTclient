import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GlobalError from '../global-error';

vi.mock('../error.module.css', () => ({
  default: {
    container: 'container',
    content: 'content',
    title: 'title',
    message: 'message',
    button: 'button',
  },
}));

describe('GlobalError Component', () => {
  const mockError = new Error('Global test error');
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should render global error message and reload button', () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(screen.getByText('Critical error!')).toBeInTheDocument();
    expect(screen.getByText('Please reload the page')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument();
  });

  it('should render complete HTML structure', () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(screen.getByText('Critical error!')).toBeInTheDocument();
    expect(screen.getByText('Please reload the page')).toBeInTheDocument();
  });

  it('should call reset function when reload button is clicked', () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    const reloadButton = screen.getByRole('button', { name: /reload/i });
    fireEvent.click(reloadButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('should log global error to console on mount', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(consoleSpy).toHaveBeenCalledWith('Global error:', mockError);
  });

  it('should handle error with digest property', () => {
    const errorWithDigest = Object.assign(mockError, { digest: 'global-digest' });
    const consoleSpy = vi.spyOn(console, 'error');

    render(<GlobalError error={errorWithDigest} reset={mockReset} />);

    expect(consoleSpy).toHaveBeenCalledWith('Global error:', errorWithDigest);
    expect(screen.getByText('Critical error!')).toBeInTheDocument();
  });

  it('should apply correct CSS classes', () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(screen.getByText('Critical error!')).toHaveClass('title');
    expect(screen.getByText('Please reload the page')).toHaveClass('message');
    expect(screen.getByRole('button', { name: /reload/i })).toHaveClass('button');
  });

  it('should re-run effect when error changes', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    const { rerender } = render(<GlobalError error={mockError} reset={mockReset} />);

    const newError = new Error('New global error');
    rerender(<GlobalError error={newError} reset={mockReset} />);

    expect(consoleSpy).toHaveBeenCalledTimes(2);
    expect(consoleSpy).toHaveBeenLastCalledWith('Global error:', newError);
  });

  it('should have different content from regular Error component', () => {
    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(screen.getByText('Critical error!')).toBeInTheDocument();
    expect(screen.getByText('Please reload the page')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong!')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });
});
