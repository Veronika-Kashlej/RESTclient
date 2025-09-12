'use client';

import { useState } from 'react';
import MethodSelector from '../components/MethodSelector';
import UrlInput from '../components/UrlInput';
import HeadersEditor from '../components/HeadersEditor';
import BodyEditor, { type BodyType } from '../components/BodyEditor';
import CodeGenerator from '../components/codeGenerator/CodeGenerator';
import type { HttpMethod, HeaderItem } from '../types/interfaces';
import './ClientComponent.sass';

export default function ClientComponent() {
  const [selectedMethod, setSelectedMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState<string>('');
  const [headers, setHeaders] = useState<HeaderItem[]>([]);
  const [bodyType, setBodyType] = useState<BodyType>('json');
  const [bodyContent, setBodyContent] = useState<string>('');
  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: unknown;
    time: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMethodChange = (method: HttpMethod) => {
    setSelectedMethod(method);
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
  };

  const handleHeadersChange = (newHeaders: HeaderItem[]) => {
    setHeaders(newHeaders);
  };

  const handleBodyTypeChange = (type: BodyType) => {
    setBodyType(type);
  };

  const handleBodyContentChange = (content: string) => {
    setBodyContent(content);
  };

  const handleSendRequest = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const headersObj: Record<string, string> = {};
      headers.forEach((header) => {
        if (header.key.trim() && header.value.trim()) {
          headersObj[header.key.trim()] = header.value.trim();
        }
      });

      let requestBody = '';
      if (bodyContent.trim() && ['POST', 'PUT', 'PATCH'].includes(selectedMethod)) {
        requestBody = bodyContent.trim();
      }

      const apiResponse = await fetch('/api/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: selectedMethod,
          url: url.trim(),
          headers: headersObj,
          body: requestBody,
        }),
      });

      const data = await apiResponse.json();

      if (!apiResponse.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>REST Client</h1>
      <p className="h2">Test your REST APIs with our powerful client.</p>

      <div className="client-interface">
        <div className="client-interface__method">
          <label htmlFor="method-selector" className="client-interface__label">
            HTTP Method:
          </label>
          <MethodSelector selectedMethod={selectedMethod} onMethodChange={handleMethodChange} />
        </div>

        <UrlInput url={url} onUrlChange={handleUrlChange} />

        <HeadersEditor headers={headers} onHeadersChange={handleHeadersChange} />

        <BodyEditor
          bodyType={bodyType}
          bodyContent={bodyContent}
          onBodyTypeChange={handleBodyTypeChange}
          onBodyContentChange={handleBodyContentChange}
        />

        <CodeGenerator
          method={selectedMethod}
          url={url}
          headers={headers}
          bodyContent={bodyContent}
        />

        <div className="client-interface__send">
          <button
            className="client-interface__send-btn"
            onClick={handleSendRequest}
            disabled={loading}
            data-testid="send-button"
          >
            {loading ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </div>

      {error && (
        <div className="response-section response-section--error">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      )}

      {response && (
        <div className="response-section">
          <h2>Response</h2>

          <div className="response-status">
            <span
              className={`status-code ${response.status >= 200 && response.status < 300 ? 'success' : 'error'}`}
            >
              {response.status} {response.statusText}
            </span>
            <span className="response-time">{response.time}ms</span>
          </div>

          <div className="response-headers">
            <h3>Headers</h3>
            <div className="headers-list">
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} className="header-item">
                  <span className="header-key">{key}:</span>
                  <span className="header-value">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="response-body">
            <h3>Body</h3>
            <pre className="response-body-content">
              {typeof response.data === 'string'
                ? response.data
                : JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}
