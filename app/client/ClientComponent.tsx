'use client';

import { useState } from 'react';
import MethodSelector from '../components/MethodSelector';
import UrlInput from '../components/UrlInput';
import HeadersEditor from '../components/HeadersEditor';
import type { HttpMethod, HeaderItem } from '../types/interfaces';
import './ClientComponent.sass';

export default function ClientComponent() {
  const [selectedMethod, setSelectedMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState<string>('');
  const [headers, setHeaders] = useState<HeaderItem[]>([]);

  const handleMethodChange = (method: HttpMethod) => {
    setSelectedMethod(method);
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
  };

  const handleHeadersChange = (newHeaders: HeaderItem[]) => {
    setHeaders(newHeaders);
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
      </div>
    </>
  );
}
