import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VariablesComponent from '../variables/VariablesComponent';
import { useVariables } from '../hooks/useVariables';
import type { Variable } from '../types/interfaces';

vi.mock('../hooks/useVariables');

interface MockVariableItemProps {
  variable: Variable;
  onUpdate: (id: string, data: { key: string; value: string; description: string }) => void;
  onDelete: (id: string) => void;
}

vi.mock('../components/variables/VariableItem', () => ({
  default: ({ variable, onUpdate, onDelete }: MockVariableItemProps) => (
    <tr data-testid={`variable-item-${variable.id}`}>
      <td>{variable.key}</td>
      <td>{variable.value}</td>
      <td>{variable.description || '-'}</td>
      <td>
        <button
          onClick={() =>
            onUpdate(variable.id, { key: 'updated', value: 'updated', description: 'updated' })
          }
        >
          Update
        </button>
        <button onClick={() => onDelete(variable.id)}>Delete</button>
      </td>
    </tr>
  ),
}));

interface MockAddVariableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { key: string; value: string; description: string }) => void;
  error?: string | null;
}

vi.mock('../components/variables/AddVariableModal', () => ({
  default: ({ isOpen, onClose, onAdd, error }: MockAddVariableModalProps) =>
    isOpen ? (
      <div data-testid="add-variable-modal">
        <h2>Add Variable Modal</h2>
        {error && <div data-testid="modal-error">{error}</div>}
        <button
          onClick={() =>
            onAdd({ key: 'new_key', value: 'new_value', description: 'new_description' })
          }
        >
          Add Variable
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

Object.defineProperty(window, 'confirm', {
  value: vi.fn(() => true),
  writable: true,
});

const mockVariables: Variable[] = [
  {
    id: '1',
    key: 'API_URL',
    value: 'https://api.example.com',
    description: 'API base URL',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    key: 'API_KEY',
    value: 'secret-key-123',
    description: 'API authentication key',
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
  },
];

const mockUseVariables = {
  variables: mockVariables,
  loading: false,
  error: null,
  addVariable: vi.fn(),
  updateVariable: vi.fn(),
  deleteVariable: vi.fn(),
  clearError: vi.fn(),
  reloadVariables: vi.fn(),
};

describe('VariablesComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useVariables).mockReturnValue(mockUseVariables);
    vi.mocked(window.confirm).mockReturnValue(true);
  });

  describe('Loading State', () => {
    it('renders loading state correctly', () => {
      vi.mocked(useVariables).mockReturnValue({
        ...mockUseVariables,
        loading: true,
        variables: [],
      });

      render(<VariablesComponent />);

      expect(screen.getByText('Environment Variables')).toBeInTheDocument();
      expect(
        screen.getByText('Manage your environment variables and configurations.')
      ).toBeInTheDocument();
      expect(screen.getByText('Loading variables...')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('renders empty state when no variables exist', () => {
      vi.mocked(useVariables).mockReturnValue({
        ...mockUseVariables,
        variables: [],
      });

      render(<VariablesComponent />);

      expect(screen.getByText('No variables yet')).toBeInTheDocument();
      expect(
        screen.getByText('Add your first environment variable to get started.')
      ).toBeInTheDocument();
      expect(screen.getByText('Add Your First Variable')).toBeInTheDocument();
    });

    it('opens add modal when "Add Your First Variable" button is clicked', () => {
      vi.mocked(useVariables).mockReturnValue({
        ...mockUseVariables,
        variables: [],
      });

      render(<VariablesComponent />);

      fireEvent.click(screen.getByText('Add Your First Variable'));
      expect(screen.getByTestId('add-variable-modal')).toBeInTheDocument();
    });
  });

  describe('Variables List', () => {
    it('renders variables table when variables exist', () => {
      render(<VariablesComponent />);

      expect(screen.getByText('Key')).toBeInTheDocument();
      expect(screen.getByText('Value')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();

      expect(screen.getByTestId('variable-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('variable-item-2')).toBeInTheDocument();
    });

    it('displays correct variable data', () => {
      render(<VariablesComponent />);

      expect(screen.getByText('API_URL')).toBeInTheDocument();
      expect(screen.getByText('https://api.example.com')).toBeInTheDocument();
      expect(screen.getByText('API base URL')).toBeInTheDocument();

      expect(screen.getByText('API_KEY')).toBeInTheDocument();
      expect(screen.getByText('secret-key-123')).toBeInTheDocument();
      expect(screen.getByText('API authentication key')).toBeInTheDocument();
    });

    it('shows Add Variable button in header', () => {
      render(<VariablesComponent />);

      const addButtons = screen.getAllByText('Add Variable');
      expect(addButtons).toHaveLength(1);
      expect(addButtons[0]).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error banner when error exists', () => {
      vi.mocked(useVariables).mockReturnValue({
        ...mockUseVariables,
        error: 'Something went wrong',
      });

      render(<VariablesComponent />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('×')).toBeInTheDocument();
    });

    it('clears error when close button is clicked', () => {
      vi.mocked(useVariables).mockReturnValue({
        ...mockUseVariables,
        error: 'Something went wrong',
      });

      render(<VariablesComponent />);

      fireEvent.click(screen.getByText('×'));
      expect(mockUseVariables.clearError).toHaveBeenCalled();
    });

    it('does not display error banner when no error', () => {
      render(<VariablesComponent />);

      expect(screen.queryByText('×')).not.toBeInTheDocument();
    });
  });

  describe('Add Variable Modal', () => {
    it('opens modal when Add Variable button is clicked', () => {
      render(<VariablesComponent />);

      fireEvent.click(screen.getByText('Add Variable'));
      expect(screen.getByTestId('add-variable-modal')).toBeInTheDocument();
    });

    it('closes modal when close button is clicked', async () => {
      render(<VariablesComponent />);

      fireEvent.click(screen.getByText('Add Variable'));
      expect(screen.getByTestId('add-variable-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Close'));
      await waitFor(() => {
        expect(screen.queryByTestId('add-variable-modal')).not.toBeInTheDocument();
      });
    });

    it('adds variable and closes modal when Add Variable is clicked in modal', async () => {
      render(<VariablesComponent />);

      fireEvent.click(screen.getByText('Add Variable'));
      const modalButtons = screen.getAllByText('Add Variable');
      fireEvent.click(modalButtons[1]);

      expect(mockUseVariables.addVariable).toHaveBeenCalledWith({
        key: 'new_key',
        value: 'new_value',
        description: 'new_description',
      });

      await waitFor(() => {
        expect(screen.queryByTestId('add-variable-modal')).not.toBeInTheDocument();
      });
    });

    it('passes error to modal', () => {
      vi.mocked(useVariables).mockReturnValue({
        ...mockUseVariables,
        error: 'Duplicate key error',
      });

      render(<VariablesComponent />);

      fireEvent.click(screen.getByText('Add Variable'));
      expect(screen.getByTestId('modal-error')).toHaveTextContent('Duplicate key error');
    });
  });

  describe('Variable Operations', () => {
    it('calls updateVariable when update button is clicked', () => {
      render(<VariablesComponent />);

      const updateButtons = screen.getAllByText('Update');
      fireEvent.click(updateButtons[0]);

      expect(mockUseVariables.updateVariable).toHaveBeenCalledWith('1', {
        key: 'updated',
        value: 'updated',
        description: 'updated',
      });
    });

    it('calls deleteVariable when delete is confirmed', () => {
      render(<VariablesComponent />);

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this variable?');
      expect(mockUseVariables.deleteVariable).toHaveBeenCalledWith('1');
    });

    it('does not delete variable when delete is not confirmed', () => {
      vi.mocked(window.confirm).mockReturnValue(false);

      render(<VariablesComponent />);

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this variable?');
      expect(mockUseVariables.deleteVariable).not.toHaveBeenCalled();
    });
  });

  describe('Component Structure', () => {
    it('has correct CSS classes', () => {
      render(<VariablesComponent />);

      expect(document.querySelector('.variables-page')).toBeInTheDocument();
      expect(document.querySelector('.variables-header')).toBeInTheDocument();
      expect(document.querySelector('.variables-content')).toBeInTheDocument();
      expect(document.querySelector('.variables-table-container')).toBeInTheDocument();
      expect(document.querySelector('.variables-table')).toBeInTheDocument();
    });

    it('renders page title and description', () => {
      render(<VariablesComponent />);

      expect(
        screen.getByRole('heading', { level: 1, name: 'Environment Variables' })
      ).toBeInTheDocument();
      expect(
        screen.getByText('Manage your environment variables and configurations.')
      ).toBeInTheDocument();
    });

    it('renders table headers correctly', () => {
      render(<VariablesComponent />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(4);
      expect(headers[0]).toHaveTextContent('Key');
      expect(headers[1]).toHaveTextContent('Value');
      expect(headers[2]).toHaveTextContent('Description');
      expect(headers[3]).toHaveTextContent('Actions');
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<VariablesComponent />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('has accessible table structure', () => {
      render(<VariablesComponent />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(4);
      expect(screen.getAllByRole('row')).toHaveLength(3);
    });

    it('has accessible buttons', () => {
      render(<VariablesComponent />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      expect(screen.getByRole('button', { name: 'Add Variable' })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles variables with missing descriptions', () => {
      const variablesWithoutDesc: Variable[] = [
        {
          id: '1',
          key: 'NO_DESC_VAR',
          value: 'some_value',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Variable,
      ];

      vi.mocked(useVariables).mockReturnValue({
        ...mockUseVariables,
        variables: variablesWithoutDesc,
      });

      render(<VariablesComponent />);

      expect(screen.getByText('NO_DESC_VAR')).toBeInTheDocument();
      expect(screen.getByText('some_value')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('handles single variable correctly', () => {
      vi.mocked(useVariables).mockReturnValue({
        ...mockUseVariables,
        variables: [mockVariables[0]],
      });

      render(<VariablesComponent />);

      expect(screen.getByTestId('variable-item-1')).toBeInTheDocument();
      expect(screen.queryByTestId('variable-item-2')).not.toBeInTheDocument();
    });

    it('handles rapid modal open/close operations', async () => {
      render(<VariablesComponent />);

      fireEvent.click(screen.getByText('Add Variable'));
      expect(screen.getByTestId('add-variable-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Close'));
      await waitFor(() => {
        expect(screen.queryByTestId('add-variable-modal')).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add Variable'));
      expect(screen.getByTestId('add-variable-modal')).toBeInTheDocument();
    });

    it('maintains state consistency during error conditions', () => {
      vi.mocked(useVariables).mockReturnValue({
        ...mockUseVariables,
        error: 'Network error',
        variables: mockVariables,
      });

      render(<VariablesComponent />);

      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByTestId('variable-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('variable-item-2')).toBeInTheDocument();
    });
  });

  describe('Integration with useVariables Hook', () => {
    it('passes correct parameters to hook functions', () => {
      render(<VariablesComponent />);

      const updateButtons = screen.getAllByText('Update');
      fireEvent.click(updateButtons[1]);

      expect(mockUseVariables.updateVariable).toHaveBeenCalledWith('2', {
        key: 'updated',
        value: 'updated',
        description: 'updated',
      });

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[1]);

      expect(mockUseVariables.deleteVariable).toHaveBeenCalledWith('2');
    });

    it('responds to hook state changes', () => {
      const { rerender } = render(<VariablesComponent />);

      expect(screen.getByTestId('variable-item-1')).toBeInTheDocument();

      vi.mocked(useVariables).mockReturnValue({
        ...mockUseVariables,
        variables: [],
      });

      rerender(<VariablesComponent />);

      expect(screen.queryByTestId('variable-item-1')).not.toBeInTheDocument();
      expect(screen.getByText('No variables yet')).toBeInTheDocument();
    });

    it('handles loading state transitions', () => {
      vi.mocked(useVariables).mockReturnValue({
        ...mockUseVariables,
        loading: true,
        variables: [],
      });

      const { rerender } = render(<VariablesComponent />);
      expect(screen.getByText('Loading variables...')).toBeInTheDocument();

      vi.mocked(useVariables).mockReturnValue({
        ...mockUseVariables,
        loading: false,
        variables: mockVariables,
      });

      rerender(<VariablesComponent />);
      expect(screen.queryByText('Loading variables...')).not.toBeInTheDocument();
      expect(screen.getByTestId('variable-item-1')).toBeInTheDocument();
    });
  });
});
