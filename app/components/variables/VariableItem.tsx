import { useState } from 'react';
import type { Variable, VariableFormData } from '../../types/interfaces';

interface VariableItemProps {
  variable: Variable;
  onUpdate: (id: string, data: VariableFormData) => void;
  onDelete: (id: string) => void;
}

export default function VariableItem({ variable, onUpdate, onDelete }: VariableItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<VariableFormData>({
    key: variable.key,
    value: variable.value,
    description: variable.description || '',
  });

  const handleSave = () => {
    if (formData.key.trim() && formData.value.trim()) {
      onUpdate(variable.id, formData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      key: variable.key,
      value: variable.value,
      description: variable.description || '',
    });
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <tr className="variable-item variable-item--editing">
        <td>
          <input
            type="text"
            value={formData.key}
            onChange={(e) => setFormData((prev) => ({ ...prev, key: e.target.value }))}
            onKeyDown={handleKeyPress}
            className="variable-input"
            placeholder="Variable key"
            autoFocus
          />
        </td>
        <td>
          <input
            type="text"
            value={formData.value}
            onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
            onKeyDown={handleKeyPress}
            className="variable-input"
            placeholder="Variable value"
          />
        </td>
        <td>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            onKeyDown={handleKeyPress}
            className="variable-input"
            placeholder="Description (optional)"
          />
        </td>
        <td>
          <div className="variable-actions">
            <button
              onClick={handleSave}
              className="variable-btn variable-btn--save"
              disabled={!formData.key.trim() || !formData.value.trim()}
            >
              Save
            </button>
            <button onClick={handleCancel} className="variable-btn variable-btn--cancel">
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="variable-item">
      <td className="variable-key">{variable.key}</td>
      <td className="variable-value">{variable.value}</td>
      <td className="variable-description">{variable.description || '-'}</td>
      <td>
        <div className="variable-actions">
          <button onClick={() => setIsEditing(true)} className="variable-btn variable-btn--edit">
            Edit
          </button>
          <button
            onClick={() => onDelete(variable.id)}
            className="variable-btn variable-btn--delete"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
