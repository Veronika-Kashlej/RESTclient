import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ClientComponent from '../client/ClientComponent';

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

vi.mock('../client/ClientComponent.sass', () => ({}));

vi.mock('../hooks/useUrlSync', () => ({
  useUrlSync: vi.fn(),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ClientComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all components', () => {
    render(<ClientComponent />);

    expect(screen.getByText('REST Client')).toBeInTheDocument();
    expect(screen.getByText('Test your REST APIs with our powerful client.')).toBeInTheDocument();
    expect(screen.getByTestId('method-selector')).toBeInTheDocument();
    expect(screen.getByTestId('url-input')).toBeInTheDocument();
    expect(screen.getByTestId('headers-editor')).toBeInTheDocument();
    expect(screen.getByTestId('body-editor')).toBeInTheDocument();
    expect(screen.getByTestId('code-generator')).toBeInTheDocument();
    expect(screen.getByTestId('send-button')).toBeInTheDocument();
  });

  it('should handle method change', () => {
    render(<ClientComponent />);

    const methodSelector = screen.getByTestId('method-selector');
    fireEvent.change(methodSelector, { target: { value: 'POST' } });

    expect(methodSelector).toHaveValue('POST');
  });

  it('should handle URL change', () => {
    render(<ClientComponent />);

    const urlInput = screen.getByTestId('url-input');
    fireEvent.change(urlInput, { target: { value: 'https://api.example.com' } });

    expect(urlInput).toHaveValue('https://api.example.com');
  });

  it('should handle headers change', () => {
    render(<ClientComponent />);

    const addHeaderButton = screen.getByText('Add Header');
    fireEvent.click(addHeaderButton);

    expect(screen.getAllByText('Headers: 1')).toHaveLength(2);
  });

  it('should handle body type change', () => {
    render(<ClientComponent />);

    const bodyTypeSelector = screen.getByTestId('body-type-selector');
    fireEvent.change(bodyTypeSelector, { target: { value: 'text' } });

    expect(bodyTypeSelector).toHaveValue('text');
  });

  it('should handle body content change', () => {
    render(<ClientComponent />);

    const bodyContent = screen.getByTestId('body-content');
    fireEvent.change(bodyContent, { target: { value: '{"test": "data"}' } });

    expect(bodyContent).toHaveValue('{"test": "data"}');
  });

  it('should show error when URL is empty', async () => {
    render(<ClientComponent />);

    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a URL')).toBeInTheDocument();
    });
  });

  it('should send request successfully', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      data: { message: 'Success' },
      time: 150,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<ClientComponent />);

    const urlInput = screen.getByTestId('url-input');
    const sendButton = screen.getByTestId('send-button');

    fireEvent.change(urlInput, { target: { value: 'https://api.example.com' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Response')).toBeInTheDocument();
      expect(screen.getByText('200 OK')).toBeInTheDocument();
      expect(screen.getByText('150ms')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method: 'GET',
        url: 'https://api.example.com',
        headers: {},
        body: '',
      }),
    });
  });

  it('should handle request error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ClientComponent />);

    const urlInput = screen.getByTestId('url-input');
    const sendButton = screen.getByTestId('send-button');

    fireEvent.change(urlInput, { target: { value: 'https://api.example.com' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should show loading state during request', async () => {
    let resolvePromise: (value: unknown) => void = () => {};
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(promise);

    render(<ClientComponent />);

    const urlInput = screen.getByTestId('url-input');
    const sendButton = screen.getByTestId('send-button');

    fireEvent.change(urlInput, { target: { value: 'https://api.example.com' } });
    fireEvent.click(sendButton);

    expect(screen.getByText('Sending...')).toBeInTheDocument();
    expect(sendButton).toBeDisabled();

    if (resolvePromise) {
      resolvePromise({
        ok: true,
        json: () =>
          Promise.resolve({ status: 200, statusText: 'OK', headers: {}, data: {}, time: 100 }),
      });
    }

    await waitFor(() => {
      expect(screen.getByText('Send Request')).toBeInTheDocument();
      expect(sendButton).not.toBeDisabled();
    });
  });

  it('should include headers in request body', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: {},
      time: 100,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<ClientComponent />);

    const addHeaderButton = screen.getByText('Add Header');
    fireEvent.click(addHeaderButton);

    const urlInput = screen.getByTestId('url-input');
    const sendButton = screen.getByTestId('send-button');

    fireEvent.change(urlInput, { target: { value: 'https://api.example.com' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'GET',
          url: 'https://api.example.com',
          headers: { Test: 'Value' },
          body: '',
        }),
      });
    });
  });

  it('should include body content for POST requests', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: {},
      time: 100,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<ClientComponent />);

    const methodSelector = screen.getByTestId('method-selector');
    fireEvent.change(methodSelector, { target: { value: 'POST' } });

    const bodyContent = screen.getByTestId('body-content');
    fireEvent.change(bodyContent, { target: { value: '{"test": "data"}' } });

    const urlInput = screen.getByTestId('url-input');
    const sendButton = screen.getByTestId('send-button');

    fireEvent.change(urlInput, { target: { value: 'https://api.example.com' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'POST',
          url: 'https://api.example.com',
          headers: {},
          body: '{"test":"data"}',
        }),
      });
    });
  });
});
