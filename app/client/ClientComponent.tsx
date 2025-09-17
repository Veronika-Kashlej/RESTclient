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

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = null;
      }

      if (!apiResponse.ok) {
        throw new Error(data?.error || 'Request failed');
      }

      setResponse(data);

      await addDoc(collection(db, 'requests'), {
        method: selectedMethod,
        url: substitutedUrl.trim(),
        status,
        timingMs: durationMs,
        requestSizeBytes: requestSize,
        responseSizeBytes: responseSize,
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
      </div>
    </div>
  );
}
