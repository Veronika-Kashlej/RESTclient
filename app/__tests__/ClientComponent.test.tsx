import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ClientComponent from '../[locale]/client/ClientComponent';

vi.mock('../components/MethodSelector', () => ({
  default: ({
    selectedMethod,
    onMethodChange,
  }: {
    selectedMethod: string;
    onMethodChange: (method: string) => void;
  }) => (
    <select
      data-testid="method-selector"
      value={selectedMethod}
      onChange={(e) => onMethodChange(e.target.value)}
    >
      <option value="GET">GET</option>
      <option value="POST">POST</option>
      <option value="PUT">PUT</option>
      <option value="DELETE">DELETE</option>
    </select>
  ),
}));

vi.mock('../components/UrlInput', () => ({
  default: ({ url, onUrlChange }: { url: string; onUrlChange: (url: string) => void }) => (
    <input
      data-testid="url-input"
      value={url}
      onChange={(e) => onUrlChange(e.target.value)}
      placeholder="Enter URL"
    />
  ),
}));

vi.mock('../components/HeadersEditor', () => ({
  default: ({
    headers,
    onHeadersChange,
  }: {
    headers: unknown[];
    onHeadersChange: (headers: unknown[]) => void;
  }) => (
    <div data-testid="headers-editor">
      <div>Headers: {headers.length}</div>
      <button
        onClick={() => onHeadersChange([...headers, { id: '1', key: 'Test', value: 'Value' }])}
      >
        Add Header
      </button>
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
      <select
        data-testid="body-type-selector"
        value={bodyType}
        onChange={(e) => onBodyTypeChange(e.target.value)}
      >
        <option value="json">JSON</option>
        <option value="text">Text</option>
      </select>
      <textarea
        data-testid="body-content"
        value={bodyContent}
        onChange={(e) => onBodyContentChange(e.target.value)}
        placeholder="Enter body content"
      />
    </div>
  ),
}));

vi.mock('../components/codeGenerator/CodeGenerator', () => ({
  default: ({
    method,
    url,
    headers,
    bodyContent,
  }: {
    method: string;
    url: string;
    headers: unknown[];
    bodyContent: string;
  }) => (
    <div data-testid="code-generator">
      <div>Method: {method}</div>
      <div>URL: {url}</div>
      <div>Headers: {headers.length}</div>
      <div>Body: {bodyContent}</div>
    </div>
  ),
}));

vi.mock('../hooks/useUrlSync', () => ({
  useUrlSync: vi.fn(() => ({
    updateUrl: vi.fn(),
  })),
}));

vi.mock('../../firebase/firebase', () => ({
  db: {},
}));

vi.mock('../../utils/variableSubstitution', () => ({
  substituteVariables: vi.fn((text) => text),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => ({
    get: vi.fn(() => null),
  })),
  useRouter: vi.fn(() => ({
    replace: vi.fn(),
  })),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ClientComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      json: vi.fn().mockResolvedValue({ message: 'Success' }),
      text: vi.fn().mockResolvedValue('Success'),
    });
  });

  it('renders ClientComponent with all main elements', () => {
    render(<ClientComponent />);

    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('description')).toBeInTheDocument();
    expect(screen.getByTestId('method-selector')).toBeInTheDocument();
    expect(screen.getByTestId('url-input')).toBeInTheDocument();
    expect(screen.getByTestId('headers-editor')).toBeInTheDocument();
    expect(screen.getByTestId('body-editor')).toBeInTheDocument();
    expect(screen.getByTestId('code-generator')).toBeInTheDocument();
    expect(screen.getByTestId('send-button')).toBeInTheDocument();
  });

  it('handles method change', () => {
    render(<ClientComponent />);

    const methodSelector = screen.getByTestId('method-selector');
    fireEvent.change(methodSelector, { target: { value: 'POST' } });

    expect(screen.getByTestId('code-generator')).toHaveTextContent('Method: POST');
  });

  it('handles URL change', () => {
    render(<ClientComponent />);

    const urlInput = screen.getByTestId('url-input');
    fireEvent.change(urlInput, { target: { value: 'https://api.test.com' } });

    expect(screen.getByTestId('code-generator')).toHaveTextContent('URL: https://api.test.com');
  });

  it('handles body content change', () => {
    render(<ClientComponent />);

    const bodyContent = screen.getByTestId('body-content');
    fireEvent.change(bodyContent, { target: { value: '{"test": "data"}' } });

    expect(screen.getByTestId('code-generator')).toHaveTextContent('Body: {"test": "data"}');
  });

  it('sends request when send button is clicked', async () => {
    render(<ClientComponent />);

    const urlInput = screen.getByTestId('url-input');
    fireEvent.change(urlInput, { target: { value: 'https://api.test.com' } });

    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    expect(sendButton).toHaveTextContent('sending');

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/request',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('https://api.test.com'),
        })
      );
    });
  });

  it('displays response when request is successful', async () => {
    render(<ClientComponent />);

    const urlInput = screen.getByTestId('url-input');
    fireEvent.change(urlInput, { target: { value: 'https://api.test.com' } });

    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('response')).toBeInTheDocument();
    });
  });

  it('displays error when request fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<ClientComponent />);

    const urlInput = screen.getByTestId('url-input');
    fireEvent.change(urlInput, { target: { value: 'https://api.test.com' } });

    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('error')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('handles headers change', () => {
    render(<ClientComponent />);

    const addHeaderButton = screen.getByText('Add Header');
    fireEvent.click(addHeaderButton);

    expect(screen.getByTestId('code-generator')).toHaveTextContent('Headers: 1');
  });

  it('handles body type change', () => {
    render(<ClientComponent />);

    const bodyTypeSelector = screen.getByTestId('body-type-selector');
    fireEvent.change(bodyTypeSelector, { target: { value: 'text' } });

    expect(bodyTypeSelector).toHaveValue('text');
  });

  it('disables send button when loading', async () => {
    render(<ClientComponent />);

    const urlInput = screen.getByTestId('url-input');
    fireEvent.change(urlInput, { target: { value: 'https://api.test.com' } });

    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    expect(sendButton).toBeDisabled();
  });

  it('handles response with different status codes', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers(),
      json: vi.fn().mockResolvedValue({ error: 'Not found' }),
      text: vi.fn().mockResolvedValue('Not found'),
    });

    render(<ClientComponent />);

    const urlInput = screen.getByTestId('url-input');
    fireEvent.change(urlInput, { target: { value: 'https://api.test.com' } });

    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('requestFailed')).toBeInTheDocument();
    });
  });

  it('handles response headers correctly', async () => {
    const mockHeaders = new Headers();
    mockHeaders.set('content-type', 'application/json');
    mockHeaders.set('x-custom-header', 'test-value');

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: mockHeaders,
      json: vi.fn().mockResolvedValue({ data: 'test' }),
      text: vi.fn().mockResolvedValue('{"data": "test"}'),
    });

    render(<ClientComponent />);

    const urlInput = screen.getByTestId('url-input');
    fireEvent.change(urlInput, { target: { value: 'https://api.test.com' } });

    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('response')).toBeInTheDocument();
    });
  });

  it('handles empty URL gracefully', () => {
    render(<ClientComponent />);

    const sendButton = screen.getByTestId('send-button');
    expect(sendButton).toBeInTheDocument();
  });

  it('updates code generator when multiple props change', () => {
    render(<ClientComponent />);

    const methodSelector = screen.getByTestId('method-selector');
    const urlInput = screen.getByTestId('url-input');
    const bodyContent = screen.getByTestId('body-content');

    fireEvent.change(methodSelector, { target: { value: 'POST' } });
    fireEvent.change(urlInput, { target: { value: 'https://api.test.com/users' } });
    fireEvent.change(bodyContent, { target: { value: '{"name": "test"}' } });

    const codeGenerator = screen.getByTestId('code-generator');
    expect(codeGenerator).toHaveTextContent('Method: POST');
    expect(codeGenerator).toHaveTextContent('URL: https://api.test.com/users');
    expect(codeGenerator).toHaveTextContent('Body: {"name": "test"}');
  });
});
