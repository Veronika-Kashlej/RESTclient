'use client';

import { useState, useCallback, useEffect } from 'react';
import MethodSelector from '../components/MethodSelector';
import UrlInput from '../components/UrlInput';
import HeadersEditor from '../components/HeadersEditor';
import BodyEditor, { type BodyType } from '../components/BodyEditor';
import CodeGenerator from '../components/codeGenerator/CodeGenerator';
import { useUrlSync } from '../hooks/useUrlSync';
import { useVariables } from '../hooks/useVariables';
import { substituteVariables, substituteVariablesInJson } from '../utils/variableSubstitution';
import type { HttpMethod, HeaderItem, RequestState } from '../types/interfaces';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

import { useSearchParams } from 'next/navigation';

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
  const [isStateRestored, setIsStateRestored] = useState(false);

  const { variables } = useVariables();

  const searchParams = useSearchParams();

  const requestState: RequestState = {
    method: selectedMethod,
    url,
    headers,
    bodyType,
    bodyContent,
    response,
    error,
  };

  const handleStateRestore = useCallback(
    (restoredState: RequestState) => {
      setSelectedMethod(restoredState.method);
      setUrl(restoredState.url);
      setHeaders(restoredState.headers);
      setBodyType(restoredState.bodyType);
      setBodyContent(restoredState.bodyContent);
      if (restoredState.response !== undefined) {
        setResponse(restoredState.response);
      }
      if (restoredState.error !== undefined) {
        setError(restoredState.error);
      }
      setIsStateRestored(true);
    },
    [setSelectedMethod, setUrl, setHeaders, setBodyType, setBodyContent, setResponse, setError]
  );

  const substituteRequestVariables = useCallback(
    (url: string, headers: HeaderItem[], bodyContent: string) => {
      const substitutedUrl = substituteVariables(url, variables);

      const substitutedHeaders = headers.map((header) => ({
        ...header,
        value: substituteVariables(header.value, variables),
      }));

      let substitutedBody = bodyContent;
      if (bodyType === 'json' && bodyContent.trim()) {
        substitutedBody = substituteVariablesInJson(bodyContent, variables);
      } else {
        substitutedBody = substituteVariables(bodyContent, variables);
      }

      return {
        url: substitutedUrl,
        headers: substitutedHeaders,
        body: substitutedBody,
      };
    },
    [variables, bodyType]
  );

  useUrlSync(requestState, handleStateRestore);

  useEffect(() => {
    const method = searchParams.get('method');
    const url = searchParams.get('url');
    const headers = searchParams.get('headers');
    const bodyType = searchParams.get('bodyType');
    const bodyContent = searchParams.get('bodyContent');
    const responseStatus = searchParams.get('responseStatus');
    const responseHeaders = searchParams.get('responseHeaders');
    const responseBody = searchParams.get('responseBody');
    const responseTime = searchParams.get('responseTime');
    if (
      method ||
      url ||
      headers ||
      bodyType ||
      bodyContent ||
      responseStatus ||
      responseHeaders ||
      responseBody ||
      responseTime
    ) {
      if (method) setSelectedMethod(method as HttpMethod);
      if (url) setUrl(decodeURIComponent(url));
      if (headers) {
        try {
          setHeaders(JSON.parse(decodeURIComponent(headers)));
        } catch {
          console.warn('Invalid headers format');
        }
      }
      if (bodyType) setBodyType(bodyType as BodyType);
      if (bodyContent) setBodyContent(decodeURIComponent(bodyContent));
      if (responseStatus || responseHeaders || responseBody || responseTime) {
        try {
          const responseData = {
            status: responseStatus ? parseInt(responseStatus) : 0,
            statusText: '',
            headers: responseHeaders ? JSON.parse(decodeURIComponent(responseHeaders)) : {},
            data: responseBody ? decodeURIComponent(responseBody) : null,
            time: responseTime ? parseFloat(responseTime) : 0,
          };
          if (typeof responseData.data === 'string') {
            try {
              responseData.data = JSON.parse(responseData.data);
            } catch {
              console.warn('Response body is not valid JSON, keeping as string');
            }
          }
          setResponse(responseData);
        } catch (error) {
          console.warn('Error parsing response data from history:', error);
        }
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isStateRestored && url.trim()) {
      setIsStateRestored(false);
      const timer = setTimeout(() => {
        if (!url.trim()) {
          setError('Please enter a URL');
          return;
        }

        setLoading(true);
        setError(null);
        setResponse(null);

        const {
          url: substitutedUrl,
          headers: substitutedHeaders,
          body: substitutedBody,
        } = substituteRequestVariables(url, headers, bodyContent);

        const headersObj: Record<string, string> = {};
        substitutedHeaders.forEach((header) => {
          if (header.key.trim() && header.value.trim()) {
            headersObj[header.key.trim()] = header.value.trim();
          }
        });

        let requestBody = '';
        if (substitutedBody.trim() && ['POST', 'PUT', 'PATCH'].includes(selectedMethod)) {
          requestBody = substitutedBody.trim();
        }

        const autoRequestPayload = {
          method: selectedMethod,
          url: substitutedUrl.trim(),
          headers: headersObj,
          body: requestBody,
        };

        fetch('/api/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(autoRequestPayload),
        })
          .then(async (apiResponse) => {
            const data = await apiResponse.json();
            if (!apiResponse.ok) {
              throw new Error(data.error || 'Request failed');
            }
            setResponse(data);
          })
          .catch((err) => {
            setError(err instanceof Error ? err.message : 'Request failed');
          })
          .finally(() => {
            setLoading(false);
          });
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isStateRestored, url, selectedMethod, headers, bodyContent, substituteRequestVariables]);

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

    const startTime = performance.now();

    try {
      const {
        url: substitutedUrl,
        headers: substitutedHeaders,
        body: substitutedBody,
      } = substituteRequestVariables(url, headers, bodyContent);

      const headersObj: Record<string, string> = {};
      substitutedHeaders.forEach((header) => {
        if (header.key.trim() && header.value.trim()) {
          headersObj[header.key.trim()] = header.value.trim();
        }
      });

      let requestBody = '';
      if (substitutedBody.trim() && ['POST', 'PUT', 'PATCH'].includes(selectedMethod)) {
        requestBody = substitutedBody.trim();
      }

      const requestPayload = {
        method: selectedMethod,
        url: substitutedUrl.trim(),
        headers: headersObj,
        body: requestBody,
      };

      const apiResponse = await fetch('/api/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      const endTime = performance.now();
      const durationMs = endTime - startTime;

      const status = apiResponse.status;

      const requestSize = new TextEncoder().encode(JSON.stringify(requestPayload)).length;

      const responseText = await apiResponse.text();
      const responseSize = new TextEncoder().encode(responseText).length;
      const responseHeaders: Record<string, string> = {};
      apiResponse.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }

      if (!apiResponse.ok) {
        throw new Error(data?.error || 'Request failed');
      }

      setResponse({
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        headers: responseHeaders,
        data: data,
        time: durationMs,
      });

      await addDoc(collection(db, 'requests'), {
        method: selectedMethod,
        url: substitutedUrl.trim(),
        status,
        timingMs: durationMs,
        requestSizeBytes: requestSize,
        responseSizeBytes: responseSize,
        headers: responseHeaders,
        bodyType: 'json',
        bodyContent: responseText,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-page-wrapper">
      <div className="client-page">
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
                {Object.entries(response.headers || {}).map(([key, value]) => (
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
      </div>
    </div>
  );
}
