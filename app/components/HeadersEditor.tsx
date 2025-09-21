'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { HeaderItem, HeadersEditorProps } from '../types/interfaces';
import './HeadersEditor.sass';

export default function HeadersEditor({ headers, onHeadersChange }: HeadersEditorProps) {
  const t = useTranslations('client');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const addHeader = () => {
    if (newKey.trim() && newValue.trim()) {
      const newHeader: HeaderItem = {
        id: Date.now().toString(),
        key: newKey.trim(),
        value: newValue.trim(),
      };
      onHeadersChange([...headers, newHeader]);
      setNewKey('');
      setNewValue('');
    }
  };

  const updateHeader = (id: string, field: 'key' | 'value', value: string) => {
    const updatedHeaders = headers.map((header) =>
      header.id === id ? { ...header, [field]: value } : header
    );
    onHeadersChange(updatedHeaders);
  };

  const removeHeader = (id: string) => {
    const updatedHeaders = headers.filter((header) => header.id !== id);
    onHeadersChange(updatedHeaders);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addHeader();
    }
  };

  return (
    <div className="headers-editor">
      <h3 className="headers-editor__title">Headers</h3>

      <div className="headers-editor__list">
        {headers.map((header) => (
          <div key={header.id} className="headers-editor__item">
            <input
              type="text"
              value={header.key}
              onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
              placeholder="Header name"
              className="headers-editor__input headers-editor__input--key"
              data-testid={`header-key-${header.id}`}
            />
            <input
              type="text"
              value={header.value}
              onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
              placeholder="Header value"
              className="headers-editor__input headers-editor__input--value"
              data-testid={`header-value-${header.id}`}
            />
            <button
              onClick={() => removeHeader(header.id)}
              className="headers-editor__remove"
              data-testid={`remove-header-${header.id}`}
              title="Remove header"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="headers-editor__add">
        <input
          type="text"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="Header name"
          className="headers-editor__input headers-editor__input--key"
          onKeyPress={handleKeyPress}
          data-testid="new-header-key"
        />
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Header value"
          className="headers-editor__input headers-editor__input--value"
          onKeyPress={handleKeyPress}
          data-testid="new-header-value"
        />
        <button
          onClick={addHeader}
          className="headers-editor__add-btn"
          disabled={!newKey.trim() || !newValue.trim()}
          data-testid="add-header"
        >
          {t('addHeader')}
        </button>
      </div>
    </div>
  );
}
