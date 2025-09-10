import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UrlInput from '../components/UrlInput';

describe('UrlInput Component', () => {
  const mockOnUrlChange = vi.fn();

  beforeEach(() => {
    mockOnUrlChange.mockClear();
  });

  it('renders URL input field', () => {
    render(<UrlInput url="" onUrlChange={mockOnUrlChange} />);

    expect(screen.getByLabelText('URL:')).toBeInTheDocument();
    expect(screen.getByTestId('url-input')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://api.example.com/endpoint')).toBeInTheDocument();
  });

  it('displays initial URL value', () => {
    render(<UrlInput url="https://api.example.com" onUrlChange={mockOnUrlChange} />);

    expect(screen.getByDisplayValue('https://api.example.com')).toBeInTheDocument();
  });

  it('calls onUrlChange when user types', () => {
    render(<UrlInput url="" onUrlChange={mockOnUrlChange} />);

    const input = screen.getByTestId('url-input');
    fireEvent.change(input, { target: { value: 'https://test.com' } });

    expect(mockOnUrlChange).toHaveBeenCalledWith('https://test.com');
  });

  it('validates URL with protocol correctly', () => {
    render(<UrlInput url="https://api.example.com" onUrlChange={mockOnUrlChange} />);

    const input = screen.getByTestId('url-input');
    expect(input).not.toHaveClass('url-input__field--error');
    expect(screen.queryByTestId('url-error')).not.toBeInTheDocument();
  });

  it('validates URL without protocol correctly', () => {
    render(<UrlInput url="www.example.com" onUrlChange={mockOnUrlChange} />);

    const input = screen.getByTestId('url-input');
    expect(input).not.toHaveClass('url-input__field--error');
    expect(screen.queryByTestId('url-error')).not.toBeInTheDocument();
  });

  it('validates relative path correctly', () => {
    render(<UrlInput url="/api/users" onUrlChange={mockOnUrlChange} />);

    const input = screen.getByTestId('url-input');
    expect(input).not.toHaveClass('url-input__field--error');
    expect(screen.queryByTestId('url-error')).not.toBeInTheDocument();
  });

  it('shows error for invalid URL', () => {
    render(<UrlInput url="invalid-url" onUrlChange={mockOnUrlChange} />);

    const input = screen.getByTestId('url-input');
    expect(input).toHaveClass('url-input__field--error');
    expect(screen.getByTestId('url-error')).toBeInTheDocument();
    expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
  });

  it('shows custom error message when provided', () => {
    render(
      <UrlInput
        url="invalid-url"
        onUrlChange={mockOnUrlChange}
        errorMessage="Custom error message"
      />
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('does not show error for empty URL', () => {
    render(<UrlInput url="" onUrlChange={mockOnUrlChange} />);

    const input = screen.getByTestId('url-input');
    expect(input).not.toHaveClass('url-input__field--error');
    expect(screen.queryByTestId('url-error')).not.toBeInTheDocument();
  });

  it('does not show error for whitespace-only URL', () => {
    render(<UrlInput url="   " onUrlChange={mockOnUrlChange} />);

    const input = screen.getByTestId('url-input');
    expect(input).not.toHaveClass('url-input__field--error');
    expect(screen.queryByTestId('url-error')).not.toBeInTheDocument();
  });

  it('validates localhost URL correctly', () => {
    render(<UrlInput url="localhost:3000" onUrlChange={mockOnUrlChange} />);

    const input = screen.getByTestId('url-input');
    expect(input).not.toHaveClass('url-input__field--error');
    expect(screen.queryByTestId('url-error')).not.toBeInTheDocument();
  });

  it('validates different protocols correctly', () => {
    const protocols = ['http://', 'https://', 'ftp://'];

    protocols.forEach((protocol) => {
      const { unmount } = render(
        <UrlInput url={`${protocol}example.com`} onUrlChange={mockOnUrlChange} />
      );

      const input = screen.getByTestId('url-input');
      expect(input).not.toHaveClass('url-input__field--error');

      unmount();
    });
  });
});
