'use client';

import { useState } from 'react';
import { useVariables } from '../hooks/useVariables';
import VariableItem from '../components/variables/VariableItem';
import AddVariableModal from '../components/variables/AddVariableModal';
import type { VariableFormData } from '../types/interfaces';
import './VariablesComponent.sass';

export default function VariablesComponent() {
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
        <h1>Environment Variables</h1>
        <p className="h2">Manage your environment variables and configurations.</p>
        <div className="loading">Loading variables...</div>
      </div>
    );
  }

  return (
    <div className="variables-page">
      <div className="variables-header">
        <div className="variables-title">
          <h1>Environment Variables</h1>
          <p className="h2">Manage your environment variables and configurations.</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn btn--primary">
          Add Variable
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
            <h3>No variables yet</h3>
            <p>Add your first environment variable to get started.</p>
            <button onClick={() => setIsAddModalOpen(true)} className="btn btn--primary">
              Add Your First Variable
            </button>
          </div>
        ) : (
          <div className="variables-table-container">
            <table className="variables-table">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                  <th>Description</th>
                  <th>Actions</th>
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
