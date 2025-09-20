import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ToastProvider } from '../providers/ToastProvider';

vi.mock('sonner', () => ({
  Toaster: ({ position }: { position: string }) => (
    <div data-testid="toaster" data-position={position}>
      Toaster Component
    </div>
  ),
}));

describe('ToastProvider Component', () => {
  it('should render Toaster component', () => {
    render(<ToastProvider />);

    const toaster = screen.getByTestId('toaster');
    expect(toaster).toBeInTheDocument();
    expect(toaster).toHaveTextContent('Toaster Component');
  });

  it('should render Toaster with correct position', () => {
    render(<ToastProvider />);

    const toaster = screen.getByTestId('toaster');
    expect(toaster).toHaveAttribute('data-position', 'top-right');
  });

  it('should render without errors', () => {
    expect(() => {
      render(<ToastProvider />);
    }).not.toThrow();
  });

  it('should render as a self-closing component', () => {
    const { container } = render(<ToastProvider />);

    const toaster = screen.getByTestId('toaster');
    expect(toaster).toBeInTheDocument();
    expect(container.firstChild).toBe(toaster);
  });
});
