'use client';

import { useState } from 'react';
import MethodSelector from '../components/MethodSelector';
import type { HttpMethod } from '../types/interfaces';
import './ClientComponent.sass';

export default function ClientComponent() {
  const [selectedMethod, setSelectedMethod] = useState<HttpMethod>('GET');

  const handleMethodChange = (method: HttpMethod) => {
    setSelectedMethod(method);
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
      </div>
    </>
  );
}
