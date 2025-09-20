import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ClientComponent from '../client/ClientComponent';
import { useUrlSync } from '../hooks/useUrlSync';
import { useVariables } from '../hooks/useVariables';

vi.mock('../hooks/useUrlSync');
vi.mock('../hooks/useVariables');
vi.mock('firebase/firestore');
vi.mock('../firebase/firebase', () => ({ db: {} }));

vi.mock('../components/MethodSelector', () => ({
  default: ({
    selectedMethod,
    onMethodChange,
  }: {
    selectedMethod: string;
    onMethodChange: (method: string) => void;
  }) => (
    <div data-testid="method-selector">
      <span>Method: {selectedMethod}</span>
      <button onClick={() => onMethodChange('POST')}>Change to POST</button>
    </div>
  ),
}));

vi.mock('../components/UrlInput', () => ({
  default: ({ url, onUrlChange }: { url: string; onUrlChange: (url: string) => void }) => (
    <input
      value={url}
      onChange={(e) => onUrlChange(e.target.value)}
      placeholder="Enter URL"
      data-testid="url-input-field"
    />
  ),
}));

vi.mock('../components/HeadersEditor', () => ({
  default: ({ headers }: { headers: Array<{ id: string; key: string; value: string }> }) => (
    <div data-testid="headers-editor">Headers: {headers.length}</div>
  ),
}));

vi.mock('../components/BodyEditor', () => ({
  default: ({
    bodyType,
    bodyContent,
    onBodyContentChange,
  }: {
    bodyType: string;
    bodyContent: string;
    onBodyContentChange: (content: string) => void;
  }) => (
    <div data-testid="body-editor">
      <textarea
        value={bodyContent}
        onChange={(e) => onBodyContentChange(e.target.value)}
        data-testid="body-content"
      />
      <div>Type: {bodyType}</div>
    </div>
  ),
}));

vi.mock('../components/codeGenerator/CodeGenerator', () => ({
  default: () => <div data-testid="code-generator">Code Generator</div>,
}));

global.fetch = vi.fn();

describe('ClientComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useVariables).mockReturnValue({
      variables: [],
      loading: false,
      error: null,
      addVariable: vi.fn(),
      updateVariable: vi.fn(),
      deleteVariable: vi.fn(),
      clearError: vi.fn(),
      reloadVariables: vi.fn(),
    });
    vi.mocked(useUrlSync).mockReturnValue({ updateUrl: vi.fn() });
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({ message: 'success' }),
      text: () => Promise.resolve('{"message": "success"}'),
    } as Response);
  });

  it('renders main client interface', () => {
    render(<ClientComponent />);

    expect(screen.getByRole('heading', { level: 1, name: 'REST Client' })).toBeInTheDocument();
    expect(screen.getByText('Test your REST APIs with our powerful client.')).toBeInTheDocument();
    expect(screen.getByTestId('method-selector')).toBeInTheDocument();
    expect(screen.getByTestId('url-input-field')).toBeInTheDocument();
    expect(screen.getByTestId('headers-editor')).toBeInTheDocument();
    expect(screen.getByTestId('body-editor')).toBeInTheDocument();
    expect(screen.getByTestId('code-generator')).toBeInTheDocument();
    expect(screen.getByTestId('send-button')).toBeInTheDocument();
  });

  it('shows error when URL is empty', async () => {
    render(<ClientComponent />);

    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a URL')).toBeInTheDocument();
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  it('updates URL when input changes', () => {
    render(<ClientComponent />);

    const urlInput = screen.getByTestId('url-input-field');
    fireEvent.change(urlInput, { target: { value: 'https://api.test.com' } });

    expect(urlInput).toHaveValue('https://api.test.com');
  });

  it('updates method when selector changes', () => {
    render(<ClientComponent />);

    expect(screen.getByText('Method: GET')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Change to POST'));

    expect(screen.getByText('Method: POST')).toBeInTheDocument();
  });

  it('updates body content when editor changes', () => {
    render(<ClientComponent />);

    const bodyTextarea = screen.getByTestId('body-content');
    fireEvent.change(bodyTextarea, { target: { value: '{"test": "data"}' } });

    expect(bodyTextarea).toHaveValue('{"test": "data"}');
  });

  it('calls fetch when send button is clicked with URL', async () => {
    render(<ClientComponent />);

    const urlInput = screen.getByTestId('url-input-field');
    fireEvent.change(urlInput, { target: { value: 'https://api.test.com' } });

    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/request',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });

  it('displays error when request fails', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

    render(<ClientComponent />);

    const urlInput = screen.getByTestId('url-input-field');
    fireEvent.change(urlInput, { target: { value: 'https://api.test.com' } });

    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('calls useUrlSync with request state', () => {
    render(<ClientComponent />);

    expect(useUrlSync).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: '',
        headers: [],
        bodyType: 'json',
        bodyContent: '',
      }),
      expect.any(Function)
    );
  });

  it('calls useVariables hook', () => {
    render(<ClientComponent />);

    expect(useVariables).toHaveBeenCalled();
  });
});
