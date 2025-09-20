import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MethodSelector from '../components/MethodSelector';

const mockOnMethodChange = vi.fn();

describe('MethodSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with selected method', () => {
    render(<MethodSelector selectedMethod="GET" onMethodChange={mockOnMethodChange} />);

    expect(screen.getByTestId('method-selector-button')).toBeInTheDocument();
    expect(screen.getByText('GET')).toBeInTheDocument();
    expect(screen.getByText('▼')).toBeInTheDocument();
  });

  it('opens dropdown when button is clicked', () => {
    render(<MethodSelector selectedMethod="GET" onMethodChange={mockOnMethodChange} />);

    fireEvent.click(screen.getByTestId('method-selector-button'));

    expect(screen.getByTestId('method-options')).toBeInTheDocument();
    expect(screen.getByText('▲')).toBeInTheDocument();
  });

  it('calls onMethodChange when method is selected', () => {
    render(<MethodSelector selectedMethod="GET" onMethodChange={mockOnMethodChange} />);

    fireEvent.click(screen.getByTestId('method-selector-button'));
    fireEvent.click(screen.getByTestId('method-option-post'));

    expect(mockOnMethodChange).toHaveBeenCalledWith('POST');
  });

  it('closes dropdown after method selection', () => {
    render(<MethodSelector selectedMethod="GET" onMethodChange={mockOnMethodChange} />);

    fireEvent.click(screen.getByTestId('method-selector-button'));
    expect(screen.getByTestId('method-options')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('method-option-post'));
    expect(screen.queryByTestId('method-options')).not.toBeInTheDocument();
  });

  it('highlights selected method in dropdown', () => {
    render(<MethodSelector selectedMethod="POST" onMethodChange={mockOnMethodChange} />);

    fireEvent.click(screen.getByTestId('method-selector-button'));

    const postOption = screen.getByTestId('method-option-post');
    const getOption = screen.getByTestId('method-option-get');

    expect(postOption).toHaveClass('method-selector__option--selected');
    expect(getOption).not.toHaveClass('method-selector__option--selected');
  });

  it('displays all HTTP method options', () => {
    render(<MethodSelector selectedMethod="GET" onMethodChange={mockOnMethodChange} />);

    fireEvent.click(screen.getByTestId('method-selector-button'));

    expect(screen.getByTestId('method-option-get')).toBeInTheDocument();
    expect(screen.getByTestId('method-option-post')).toBeInTheDocument();
    expect(screen.getByTestId('method-option-put')).toBeInTheDocument();
    expect(screen.getByTestId('method-option-delete')).toBeInTheDocument();
    expect(screen.getByTestId('method-option-patch')).toBeInTheDocument();
    expect(screen.getByTestId('method-option-head')).toBeInTheDocument();
    expect(screen.getByTestId('method-option-options')).toBeInTheDocument();
  });

  it('has correct CSS classes', () => {
    render(<MethodSelector selectedMethod="GET" onMethodChange={mockOnMethodChange} />);

    expect(document.querySelector('.method-selector')).toBeInTheDocument();
    expect(document.querySelector('.method-selector__dropdown')).toBeInTheDocument();
    expect(screen.getByTestId('method-selector-button')).toHaveClass('method-selector__button');
  });

  it('toggles dropdown state correctly', () => {
    render(<MethodSelector selectedMethod="GET" onMethodChange={mockOnMethodChange} />);

    const button = screen.getByTestId('method-selector-button');

    fireEvent.click(button);
    expect(screen.getByTestId('method-options')).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.queryByTestId('method-options')).not.toBeInTheDocument();
  });
});
