'use client';

import { useState } from 'react';
import { generateCode, getSupportedLanguages } from '../../utils/codeGenerator';
import type { HttpMethod, HeaderItem } from '../../types/interfaces';
import './CodeGenerator.sass';

interface CodeGeneratorProps {
  method: HttpMethod;
  url: string;
  headers: HeaderItem[];
  bodyContent: string;
}

export default function CodeGenerator({ method, url, headers, bodyContent }: CodeGeneratorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('curl');
  const languages = getSupportedLanguages();

  const hasEnoughData = url.trim().length > 0;

  const headersObj: Record<string, string> = {};
  headers.forEach((header) => {
    if (header.key.trim() && header.value.trim()) {
      headersObj[header.key.trim()] = header.value.trim();
    }
  });

  let requestBody = '';
  if (bodyContent.trim() && ['POST', 'PUT', 'PATCH'].includes(method)) {
    requestBody = bodyContent.trim();
  }

  const requestData = {
    method,
    url: url.trim(),
    headers: headersObj,
    body: requestBody,
  };

  const generatedCode = hasEnoughData ? generateCode(requestData, selectedLanguage) : '';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="code-generator">
      <div className="code-generator__header">
        <h3 className="code-generator__title">Generated Code</h3>
        <div className="code-generator__controls">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="code-generator__select"
            data-testid="language-selector"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          {hasEnoughData && (
            <button
              onClick={copyToClipboard}
              className="code-generator__copy-btn"
              data-testid="copy-button"
            >
              Copy
            </button>
          )}
        </div>
      </div>

      <div className="code-generator__content">
        {!hasEnoughData ? (
          <div className="code-generator__message">
            <p>Please enter a URL to generate code</p>
          </div>
        ) : (
          <pre className="code-generator__code" data-testid="generated-code">
            {generatedCode}
          </pre>
        )}
      </div>
    </div>
  );
}
