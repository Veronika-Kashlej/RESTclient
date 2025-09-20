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
  default: ({
    headers,
    onHeadersChange,
  }: {
    headers: Array<{ id: string; key: string; value: string }>;
    onHeadersChange: (headers: Array<{ id: string; key: string; value: string }>) => void;
  }) => (
    <div data-testid="headers-editor">
      <button
        onClick={() =>
          onHeadersChange([{ id: '1', key: 'Content-Type', value: 'application/json' }])
        }
      >
        Add Header
      </button>
      <button onClick={() => onHeadersChange([{ id: '1', key: '  ', value: '  ' }])}>
        Add Empty Header
      </button>
      <div>Headers: {headers.length}</div>
    </div>
  ),
}));

vi.mock('../components/BodyEditor', () => ({
  default: ({
    bodyType,
    bodyContent,
    onBodyTypeChange,
    onBodyContentChange,
  }: {
    bodyType: string;
    bodyContent: string;
    onBodyTypeChange: (type: string) => void;
    onBodyContentChange: (content: string) => void;
  }) => (
    <div data-testid="body-editor">
      <button onClick={() => onBodyTypeChange('json')}>JSON</button>
      <button onClick={() => onBodyTypeChange('text')}>Text</button>
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

  it('updates headers when HeadersEditor changes', () => {
    render(<ClientComponent />);

    expect(screen.getByText('Headers: 0')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Add Header'));

    expect(screen.getByText('Headers: 1')).toBeInTheDocument();
  });

  it('updates body type when BodyEditor type changes', () => {
    render(<ClientComponent />);

    expect(screen.getByText('Type: json')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Text'));

    expect(screen.getByText('Type: text')).toBeInTheDocument();
  });

  it('handles empty headers correctly', async () => {
    render(<ClientComponent />);

    const urlInput = screen.getByTestId('url-input-field');
    fireEvent.change(urlInput, { target: { value: 'https://api.test.com' } });

    fireEvent.click(screen.getByText('Add Empty Header'));

    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/request',
        expect.objectContaining({
          body: expect.stringContaining('"headers":{}'),
        })
      );
    });
  });

  it('includes body for POST requests', async () => {
    render(<ClientComponent />);

    const urlInput = screen.getByTestId('url-input-field');
    fireEvent.change(urlInput, { target: { value: 'https://api.test.com' } });

    fireEvent.click(screen.getByText('Change to POST'));

    const bodyTextarea = screen.getByTestId('body-content');
    fireEvent.change(bodyTextarea, { target: { value: '{"data": "test"}' } });

    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/request',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"method":"POST"'),
        })
      );
    });
  });

  it('excludes body for GET requests', async () => {
    render(<ClientComponent />);

    const urlInput = screen.getByTestId('url-input-field');
    fireEvent.change(urlInput, { target: { value: 'https://api.test.com' } });

    const bodyTextarea = screen.getByTestId('body-content');
    fireEvent.change(bodyTextarea, { target: { value: '{"should": "be ignored"}' } });

    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/request',
        expect.objectContaining({
          body: expect.stringContaining('"body":""'),
        })
      );
    });
  });

  it('handles API response with invalid JSON', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () =>
        Promise.resolve({
          status: 200,
          statusText: 'OK',
          headers: {},
          data: null,
          time: 100,
        }),
      text: () => Promise.resolve('invalid json response'),
    } as Response);

    render(<ClientComponent />);

    const urlInput = screen.getByTestId('url-input-field');
    fireEvent.change(urlInput, { target: { value: 'https://api.test.com' } });

    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  it('handles API error response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ error: 'Invalid request' }),
      text: () => Promise.resolve('{"error": "Invalid request"}'),
    } as Response);

    render(<ClientComponent />);

    const urlInput = screen.getByTestId('url-input-field');
    fireEvent.change(urlInput, { target: { value: 'https://api.test.com' } });

    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid request')).toBeInTheDocument();
    });
  });

  it('handles API error response without error message', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({}),
      text: () => Promise.resolve('{}'),
    } as Response);

    render(<ClientComponent />);

    const urlInput = screen.getByTestId('url-input-field');
    fireEvent.change(urlInput, { target: { value: 'https://api.test.com' } });

    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Request failed')).toBeInTheDocument();
    });
  });
});
