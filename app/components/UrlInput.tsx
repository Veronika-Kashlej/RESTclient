'use client';

import { useState, useEffect } from 'react';
import type { UrlInputProps } from '../types/interfaces';
import './UrlInput.sass';

export default function UrlInput({
  url,
  onUrlChange,
  errorMessage,
}: Omit<UrlInputProps, 'isValid'>) {
  const [localUrl, setLocalUrl] = useState(url);

  useEffect(() => {
    setLocalUrl(url);
  }, [url]);

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = event.target.value;
    setLocalUrl(newUrl);
    onUrlChange(newUrl);
  };

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true;

    try {
      if (url.includes('://')) {
        new URL(url);
        return true;
      }

      if (url.startsWith('/')) {
        return true;
      }

      const urlWithProtocol = `http://${url}`;
      const urlObj = new URL(urlWithProtocol);

      return urlObj.hostname.includes('.') || urlObj.hostname === 'localhost';
    } catch {
      return false;
    }
  };

  const isUrlValid = validateUrl(localUrl);

  return (
    <div className="url-input">
      <label htmlFor="url-input" className="url-input__label">
        URL:
      </label>
      <div className="url-input__container">
        <input
          id="url-input"
          type="text"
          value={localUrl}
          onChange={handleUrlChange}
          placeholder="https://api.example.com/endpoint"
          className={`url-input__field ${!isUrlValid && localUrl.trim() ? 'url-input__field--error' : ''}`}
          data-testid="url-input"
        />
        {!isUrlValid && localUrl.trim() && (
          <div className="url-input__error" data-testid="url-error">
            {errorMessage || 'Please enter a valid URL'}
          </div>
        )}
      </div>
    </div>
  );
}
