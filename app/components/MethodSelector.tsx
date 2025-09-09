'use client';

import { useState } from 'react';
import type { HttpMethod, MethodSelectorProps } from '../types/interfaces';
import './MethodSelector.sass';

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

export default function MethodSelector({ selectedMethod, onMethodChange }: MethodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMethodSelect = (method: HttpMethod) => {
    onMethodChange(method);
    setIsOpen(false);
  };

  return (
    <div className="method-selector">
      <div className="method-selector__dropdown">
        <button
          className="method-selector__button"
          onClick={() => setIsOpen(!isOpen)}
          data-testid="method-selector-button"
        >
          <span className="method-selector__selected">{selectedMethod}</span>
          <span className="method-selector__arrow">{isOpen ? '▲' : '▼'}</span>
        </button>

        {isOpen && (
          <div className="method-selector__options" data-testid="method-options">
            {HTTP_METHODS.map((method) => (
              <button
                key={method}
                className={`method-selector__option ${
                  method === selectedMethod ? 'method-selector__option--selected' : ''
                }`}
                onClick={() => handleMethodSelect(method)}
                data-testid={`method-option-${method.toLowerCase()}`}
              >
                {method}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
