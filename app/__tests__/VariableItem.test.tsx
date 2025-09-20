import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VariableItem from '../components/variables/VariableItem';
import type { Variable } from '../types/interfaces';

const mockVariable: Variable = {
  id: '1',
  key: 'API_URL',
  value: 'https://api.example.com',
  description: 'API base URL',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
};

const mockOnUpdate = vi.fn();
const mockOnDelete = vi.fn();

describe('VariableItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Display Mode', () => {
    it('renders variable information correctly', () => {
      render(
        <table>
          <tbody>
            <VariableItem variable={mockVariable} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />
          </tbody>
        </table>
      );

      expect(screen.getByText('API_URL')).toBeInTheDocument();
      expect(screen.getByText('https://api.example.com')).toBeInTheDocument();
      expect(screen.getByText('API base URL')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('renders dash when description is empty', () => {
      const variableWithoutDescription = { ...mockVariable, description: '' };
      render(
        <table>
          <tbody>
            <VariableItem
              variable={variableWithoutDescription}
              onUpdate={mockOnUpdate}
              onDelete={mockOnDelete}
            />
          </tbody>
        </table>
      );

      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('renders dash when description is undefined', () => {
      const variableWithoutDescription = { ...mockVariable, description: undefined };
      render(
        <table>
          <tbody>
            <VariableItem
              variable={variableWithoutDescription}
              onUpdate={mockOnUpdate}
              onDelete={mockOnDelete}
            />
          </tbody>
        </table>
      );

      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('calls onDelete when delete button is clicked', () => {
      render(
        <table>
          <tbody>
            <VariableItem variable={mockVariable} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />
          </tbody>
        </table>
      );

      fireEvent.click(screen.getByText('Delete'));
      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });

    it('enters edit mode when edit button is clicked', () => {
      render(
        <table>
          <tbody>
            <VariableItem variable={mockVariable} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />
          </tbody>
        </table>
      );

      fireEvent.click(screen.getByText('Edit'));

      expect(screen.getByDisplayValue('API_URL')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://api.example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('API base URL')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      render(
        <table>
          <tbody>
            <VariableItem variable={mockVariable} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />
          </tbody>
        </table>
      );
      fireEvent.click(screen.getByText('Edit'));
    });

    it('renders input fields with current values', () => {
      expect(screen.getByDisplayValue('API_URL')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://api.example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('API base URL')).toBeInTheDocument();
    });

    it('updates form data when inputs change', () => {
      const keyInput = screen.getByDisplayValue('API_URL');
      const valueInput = screen.getByDisplayValue('https://api.example.com');
      const descriptionInput = screen.getByDisplayValue('API base URL');

      fireEvent.change(keyInput, { target: { value: 'NEW_API_URL' } });
      fireEvent.change(valueInput, { target: { value: 'https://new-api.example.com' } });
      fireEvent.change(descriptionInput, { target: { value: 'New API URL' } });

      expect(screen.getByDisplayValue('NEW_API_URL')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://new-api.example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('New API URL')).toBeInTheDocument();
    });

    it('calls onUpdate when save button is clicked with valid data', () => {
      const keyInput = screen.getByDisplayValue('API_URL');
      const valueInput = screen.getByDisplayValue('https://api.example.com');
      const descriptionInput = screen.getByDisplayValue('API base URL');

      fireEvent.change(keyInput, { target: { value: 'UPDATED_API_URL' } });
      fireEvent.change(valueInput, { target: { value: 'https://updated-api.example.com' } });
      fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });

      fireEvent.click(screen.getByText('Save'));

      expect(mockOnUpdate).toHaveBeenCalledWith('1', {
        key: 'UPDATED_API_URL',
        value: 'https://updated-api.example.com',
        description: 'Updated description',
      });
    });

    it('does not call onUpdate when key is empty', () => {
      const keyInput = screen.getByDisplayValue('API_URL');
      fireEvent.change(keyInput, { target: { value: '   ' } });

      const saveButton = screen.getByText('Save');
      expect(saveButton).toBeDisabled();

      fireEvent.click(saveButton);
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it('does not call onUpdate when value is empty', () => {
      const valueInput = screen.getByDisplayValue('https://api.example.com');
      fireEvent.change(valueInput, { target: { value: '   ' } });

      const saveButton = screen.getByText('Save');
      expect(saveButton).toBeDisabled();

      fireEvent.click(saveButton);
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it('exits edit mode and resets form when cancel button is clicked', async () => {
      const keyInput = screen.getByDisplayValue('API_URL');
      fireEvent.change(keyInput, { target: { value: 'CHANGED_KEY' } });

      fireEvent.click(screen.getByText('Cancel'));

      await waitFor(() => {
        expect(screen.getByText('API_URL')).toBeInTheDocument();
        expect(screen.queryByDisplayValue('CHANGED_KEY')).not.toBeInTheDocument();
      });
    });

    it('saves when Enter key is pressed', () => {
      const keyInput = screen.getByDisplayValue('API_URL');
      fireEvent.keyDown(keyInput, { key: 'Enter' });

      expect(mockOnUpdate).toHaveBeenCalledWith('1', {
        key: 'API_URL',
        value: 'https://api.example.com',
        description: 'API base URL',
      });
    });

    it('cancels when Escape key is pressed', async () => {
      const keyInput = screen.getByDisplayValue('API_URL');
      fireEvent.change(keyInput, { target: { value: 'CHANGED_KEY' } });
      fireEvent.keyDown(keyInput, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.getByText('API_URL')).toBeInTheDocument();
        expect(screen.queryByDisplayValue('CHANGED_KEY')).not.toBeInTheDocument();
      });
    });

    it('ignores other key presses', () => {
      const keyInput = screen.getByDisplayValue('API_URL');
      fireEvent.keyDown(keyInput, { key: 'Tab' });

      expect(screen.getByDisplayValue('API_URL')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('has correct CSS classes in edit mode', () => {
      const row = screen.getByDisplayValue('API_URL').closest('tr');
      expect(row).toHaveClass('variable-item', 'variable-item--editing');
    });
  });

  describe('Edge Cases', () => {
    it('handles variable with minimal data', () => {
      const minimalVariable: Variable = {
        id: '2',
        key: 'KEY',
        value: 'VALUE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      render(
        <table>
          <tbody>
            <VariableItem
              variable={minimalVariable}
              onUpdate={mockOnUpdate}
              onDelete={mockOnDelete}
            />
          </tbody>
        </table>
      );

      expect(screen.getByText('KEY')).toBeInTheDocument();
      expect(screen.getByText('VALUE')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('trims whitespace in form data before saving', () => {
      render(
        <table>
          <tbody>
            <VariableItem variable={mockVariable} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />
          </tbody>
        </table>
      );

      fireEvent.click(screen.getByText('Edit'));

      const keyInput = screen.getByDisplayValue('API_URL');
      const valueInput = screen.getByDisplayValue('https://api.example.com');
      const descriptionInput = screen.getByDisplayValue('API base URL');

      fireEvent.change(keyInput, { target: { value: '  TRIMMED_KEY  ' } });
      fireEvent.change(valueInput, { target: { value: '  trimmed_value  ' } });
      fireEvent.change(descriptionInput, { target: { value: '  trimmed description  ' } });

      fireEvent.click(screen.getByText('Save'));

      expect(mockOnUpdate).toHaveBeenCalledWith('1', {
        key: '  TRIMMED_KEY  ',
        value: '  trimmed_value  ',
        description: '  trimmed description  ',
      });
    });
  });
});
