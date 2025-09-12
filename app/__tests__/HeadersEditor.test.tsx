import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HeadersEditor from '../components/HeadersEditor';
import type { HeaderItem } from '../types/interfaces';

vi.mock('../components/HeadersEditor.sass', () => ({}));

describe('HeadersEditor', () => {
  const mockHeaders: HeaderItem[] = [
    { id: '1', key: 'Content-Type', value: 'application/json' },
    { id: '2', key: 'Authorization', value: 'Bearer token123' },
  ];

  const mockOnHeadersChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render headers list', () => {
    render(<HeadersEditor headers={mockHeaders} onHeadersChange={mockOnHeadersChange} />);

    expect(screen.getByText('Headers')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Content-Type')).toBeInTheDocument();
    expect(screen.getByDisplayValue('application/json')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Authorization')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bearer token123')).toBeInTheDocument();
  });

  it('should add new header when both key and value are provided', () => {
    render(<HeadersEditor headers={[]} onHeadersChange={mockOnHeadersChange} />);

    const keyInput = screen.getByTestId('new-header-key');
    const valueInput = screen.getByTestId('new-header-value');
    const addButton = screen.getByTestId('add-header');

    fireEvent.change(keyInput, { target: { value: 'X-Custom-Header' } });
    fireEvent.change(valueInput, { target: { value: 'custom-value' } });
    fireEvent.click(addButton);

    expect(mockOnHeadersChange).toHaveBeenCalledWith([
      expect.objectContaining({
        key: 'X-Custom-Header',
        value: 'custom-value',
      }),
    ]);
  });

  it('should not add header when key or value is empty', () => {
    render(<HeadersEditor headers={[]} onHeadersChange={mockOnHeadersChange} />);

    const keyInput = screen.getByTestId('new-header-key');
    const valueInput = screen.getByTestId('new-header-value');
    const addButton = screen.getByTestId('add-header');

    fireEvent.change(keyInput, { target: { value: '' } });
    fireEvent.change(valueInput, { target: { value: 'value' } });
    fireEvent.click(addButton);

    expect(mockOnHeadersChange).not.toHaveBeenCalled();

    fireEvent.change(keyInput, { target: { value: 'key' } });
    fireEvent.change(valueInput, { target: { value: '' } });
    fireEvent.click(addButton);

    expect(mockOnHeadersChange).not.toHaveBeenCalled();
  });

  it('should update header key', () => {
    render(<HeadersEditor headers={mockHeaders} onHeadersChange={mockOnHeadersChange} />);

    const keyInput = screen.getByTestId('header-key-1');
    fireEvent.change(keyInput, { target: { value: 'Updated-Type' } });

    expect(mockOnHeadersChange).toHaveBeenCalledWith([
      { id: '1', key: 'Updated-Type', value: 'application/json' },
      { id: '2', key: 'Authorization', value: 'Bearer token123' },
    ]);
  });

  it('should update header value', () => {
    render(<HeadersEditor headers={mockHeaders} onHeadersChange={mockOnHeadersChange} />);

    const valueInput = screen.getByTestId('header-value-1');
    fireEvent.change(valueInput, { target: { value: 'text/plain' } });

    expect(mockOnHeadersChange).toHaveBeenCalledWith([
      { id: '1', key: 'Content-Type', value: 'text/plain' },
      { id: '2', key: 'Authorization', value: 'Bearer token123' },
    ]);
  });

  it('should remove header', () => {
    render(<HeadersEditor headers={mockHeaders} onHeadersChange={mockOnHeadersChange} />);

    const removeButton = screen.getByTestId('remove-header-1');
    fireEvent.click(removeButton);

    expect(mockOnHeadersChange).toHaveBeenCalledWith([
      { id: '2', key: 'Authorization', value: 'Bearer token123' },
    ]);
  });

  it('should clear input fields after adding header', () => {
    render(<HeadersEditor headers={[]} onHeadersChange={mockOnHeadersChange} />);

    const keyInput = screen.getByTestId('new-header-key');
    const valueInput = screen.getByTestId('new-header-value');
    const addButton = screen.getByTestId('add-header');

    fireEvent.change(keyInput, { target: { value: 'Test-Key' } });
    fireEvent.change(valueInput, { target: { value: 'Test-Value' } });
    fireEvent.click(addButton);

    expect(keyInput).toHaveValue('');
    expect(valueInput).toHaveValue('');
  });

  it('should disable add button when inputs are empty', () => {
    render(<HeadersEditor headers={[]} onHeadersChange={mockOnHeadersChange} />);

    const addButton = screen.getByTestId('add-header');
    expect(addButton).toBeDisabled();
  });

  it('should enable add button when both inputs have values', () => {
    render(<HeadersEditor headers={[]} onHeadersChange={mockOnHeadersChange} />);

    const keyInput = screen.getByTestId('new-header-key');
    const valueInput = screen.getByTestId('new-header-value');
    const addButton = screen.getByTestId('add-header');

    fireEvent.change(keyInput, { target: { value: 'Key' } });
    fireEvent.change(valueInput, { target: { value: 'Value' } });

    expect(addButton).not.toBeDisabled();
  });
});
