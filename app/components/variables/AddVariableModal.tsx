'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { AddVariableModalProps, VariableFormData } from '../../types/interfaces';

export default function AddVariableModal({ isOpen, onClose, onAdd, error }: AddVariableModalProps) {
  const t = useTranslations('variables');
  const [formData, setFormData] = useState<VariableFormData>({
    key: '',
    value: '',
    description: '',
  });

  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ key: '', value: '', description: '' });
      setLocalError(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.key.trim()) {
      setLocalError(t('keyRequired'));
      return;
    }

    if (!formData.value.trim()) {
      setLocalError(t('valueRequired'));
      return;
    }

    onAdd(formData);
    setFormData({ key: '', value: '', description: '' });
    setLocalError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('addNew')}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyPress}>
          <div className="modal-body">
            {(error || localError) && <div className="error-message">{error || localError}</div>}

            <div className="form-group">
              <label htmlFor="key" className="form-label">
                {t('name')} *
              </label>
              <input
                id="key"
                type="text"
                value={formData.key}
                onChange={(e) => setFormData((prev) => ({ ...prev, key: e.target.value }))}
                className="form-input"
                placeholder="e.g., API_URL"
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="value" className="form-label">
                {t('value')} *
              </label>
              <input
                id="value"
                type="text"
                value={formData.value}
                onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
                className="form-input"
                placeholder="e.g., https://api.example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                {t('description')}
              </label>
              <input
                id="description"
                type="text"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="form-input"
                placeholder="Optional description"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn--secondary">
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={!formData.key.trim() || !formData.value.trim()}
            >
              {t('addVariable')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
