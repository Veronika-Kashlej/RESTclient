import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BodyEditor from '../components/BodyEditor';

vi.mock('@monaco-editor/react', () => ({
  default: ({
    value,
    onChange,
  }: {
    value?: string;
    onChange?: (value: string | undefined) => void;
  }) => (
    <textarea
      data-testid="monaco-editor"
      value={value || ''}
      onChange={(e) => onChange && onChange(e.target.value)}
    />
  ),
}));

const mockOnBodyTypeChange = vi.fn();
const mockOnBodyContentChange = vi.fn();

describe('BodyEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders body editor with JSON type', () => {
    render(
      <BodyEditor
        bodyType="json"
        bodyContent=""
        onBodyTypeChange={mockOnBodyTypeChange}
        onBodyContentChange={mockOnBodyContentChange}
      />
    );

    expect(screen.getByText('Request Body')).toBeInTheDocument();
    expect(screen.getByTestId('json-type-btn')).toBeInTheDocument();
    expect(screen.getByTestId('text-type-btn')).toBeInTheDocument();
    expect(screen.getByTestId('prettify-btn')).toBeInTheDocument();
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  it('renders body editor with text type', () => {
    render(
      <BodyEditor
        bodyType="text"
        bodyContent=""
        onBodyTypeChange={mockOnBodyTypeChange}
        onBodyContentChange={mockOnBodyContentChange}
      />
    );

    expect(screen.queryByTestId('prettify-btn')).not.toBeInTheDocument();
  });

  it('calls onBodyTypeChange when JSON button is clicked', () => {
    render(
      <BodyEditor
        bodyType="text"
        bodyContent=""
        onBodyTypeChange={mockOnBodyTypeChange}
        onBodyContentChange={mockOnBodyContentChange}
      />
    );

    fireEvent.click(screen.getByTestId('json-type-btn'));
    expect(mockOnBodyTypeChange).toHaveBeenCalledWith('json');
  });

  it('calls onBodyTypeChange when Text button is clicked', () => {
    render(
      <BodyEditor
        bodyType="json"
        bodyContent=""
        onBodyTypeChange={mockOnBodyTypeChange}
        onBodyContentChange={mockOnBodyContentChange}
      />
    );

    fireEvent.click(screen.getByTestId('text-type-btn'));
    expect(mockOnBodyTypeChange).toHaveBeenCalledWith('text');
  });

  it('calls onBodyContentChange when editor content changes', () => {
    render(
      <BodyEditor
        bodyType="json"
        bodyContent=""
        onBodyTypeChange={mockOnBodyTypeChange}
        onBodyContentChange={mockOnBodyContentChange}
      />
    );

    const editor = screen.getByTestId('monaco-editor');
    fireEvent.change(editor, { target: { value: '{"new": "content"}' } });

    expect(mockOnBodyContentChange).toHaveBeenCalledWith('{"new": "content"}');
  });

  it('shows error for invalid JSON', async () => {
    render(
      <BodyEditor
        bodyType="json"
        bodyContent=""
        onBodyTypeChange={mockOnBodyTypeChange}
        onBodyContentChange={mockOnBodyContentChange}
      />
    );

    const editor = screen.getByTestId('monaco-editor');
    fireEvent.change(editor, { target: { value: '{"invalid": json}' } });

    await waitFor(() => {
      expect(screen.getByTestId('body-editor-error')).toBeInTheDocument();
      expect(screen.getByText('Invalid JSON format')).toBeInTheDocument();
    });
  });

  it('prettifies valid JSON when prettify button is clicked', () => {
    render(
      <BodyEditor
        bodyType="json"
        bodyContent='{"name":"John","age":30}'
        onBodyTypeChange={mockOnBodyTypeChange}
        onBodyContentChange={mockOnBodyContentChange}
      />
    );

    fireEvent.click(screen.getByTestId('prettify-btn'));

    expect(mockOnBodyContentChange).toHaveBeenCalledWith('{\n  "name": "John",\n  "age": 30\n}');
  });

  it('shows error when trying to prettify invalid JSON', async () => {
    render(
      <BodyEditor
        bodyType="json"
        bodyContent='{"invalid": json}'
        onBodyTypeChange={mockOnBodyTypeChange}
        onBodyContentChange={mockOnBodyContentChange}
      />
    );

    fireEvent.click(screen.getByTestId('prettify-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('body-editor-error')).toBeInTheDocument();
      expect(screen.getByText('Cannot prettify invalid JSON')).toBeInTheDocument();
    });
  });

  it('shows active state for selected body type', () => {
    render(
      <BodyEditor
        bodyType="json"
        bodyContent=""
        onBodyTypeChange={mockOnBodyTypeChange}
        onBodyContentChange={mockOnBodyContentChange}
      />
    );

    expect(screen.getByTestId('json-type-btn')).toHaveClass('body-editor__type-btn--active');
    expect(screen.getByTestId('text-type-btn')).not.toHaveClass('body-editor__type-btn--active');
  });

  it('does not show error initially', () => {
    render(
      <BodyEditor
        bodyType="json"
        bodyContent=""
        onBodyTypeChange={mockOnBodyTypeChange}
        onBodyContentChange={mockOnBodyContentChange}
      />
    );

    expect(screen.queryByTestId('body-editor-error')).not.toBeInTheDocument();
  });
});
