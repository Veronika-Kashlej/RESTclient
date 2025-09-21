'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useVariables } from '../../hooks/useVariables';
import VariableItem from '../../components/variables/VariableItem';
import AddVariableModal from '../../components/variables/AddVariableModal';
import type { VariableFormData } from '../../types/interfaces';
import './VariablesComponent.sass';

export default function VariablesComponent() {
  const t = useTranslations('variables');
  const { variables, loading, error, addVariable, updateVariable, deleteVariable, clearError } =
    useVariables();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddVariable = (formData: VariableFormData) => {
    addVariable(formData);
    setIsAddModalOpen(false);
  };

  const handleUpdateVariable = (id: string, formData: VariableFormData) => {
    updateVariable(id, formData);
  };

  const handleDeleteVariable = (id: string) => {
    if (confirm('Are you sure you want to delete this variable?')) {
      deleteVariable(id);
    }
  };

  if (loading) {
    return (
      <div className="variables-page">
        <h1>{t('title')}</h1>
        <p className="h2">Manage your environment variables and configurations.</p>
        <div className="loading">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="variables-page">
      <div className="variables-header">
        <div className="variables-title">
          <h1>{t('title')}</h1>
          <p className="h2">Manage your environment variables and configurations.</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn btn--primary">
          {t('addVariable')}
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={clearError} className="error-close">
            ×
          </button>
        </div>
      )}

      <div className="variables-content">
        {variables.length === 0 ? (
          <div className="empty-state">
            <h3>{t('noVariables')}</h3>
            <p>{t('createFirst')}</p>
            <button onClick={() => setIsAddModalOpen(true)} className="btn btn--primary">
              {t('addVariable')}
            </button>
          </div>
        ) : (
          <div className="variables-table-container">
            <table className="variables-table">
              <thead>
                <tr>
                  <th>{t('name')}</th>
                  <th>{t('value')}</th>
                  <th>{t('description')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {variables.map((variable) => (
                  <VariableItem
                    key={variable.id}
                    variable={variable}
                    onUpdate={handleUpdateVariable}
                    onDelete={handleDeleteVariable}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddVariableModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddVariable}
        error={error}
      />
    </div>
  );
}
