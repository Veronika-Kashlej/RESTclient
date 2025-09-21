import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddVariableModal from '../components/variables/AddVariableModal';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      addNew: 'Add New Variable',
      name: 'Key',
      value: 'Value',
      description: 'Description',
      cancel: 'Cancel',
      addVariable: 'Add Variable',
      keyRequired: 'Key is required',
      valueRequired: 'Value is required',
    };
    return translations[key] || key;
  }),
}));

const mockOnClose = vi.fn();
const mockOnAdd = vi.fn();

describe('AddVariableModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('does not render when isOpen is false', () => {
      render(<AddVariableModal isOpen={false} onClose={mockOnClose} onAdd={mockOnAdd} />);

      expect(screen.queryByText('Add New Variable')).not.toBeInTheDocument();
    });

    it('renders modal when isOpen is true', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      expect(screen.getByText('Add New Variable')).toBeInTheDocument();
      expect(screen.getByLabelText('Key *')).toBeInTheDocument();
      expect(screen.getByLabelText('Value *')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Variable' })).toBeInTheDocument();
    });

    it('has correct CSS classes and structure', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      expect(document.querySelector('.modal-overlay')).toBeInTheDocument();
      expect(document.querySelector('.modal-content')).toBeInTheDocument();
      expect(document.querySelector('.modal-header')).toBeInTheDocument();
      expect(document.querySelector('.modal-body')).toBeInTheDocument();
      expect(document.querySelector('.modal-footer')).toBeInTheDocument();
    });

    it('renders form inputs with correct attributes', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      const keyInput = screen.getByLabelText('Key *');
      const valueInput = screen.getByLabelText('Value *');
      const descriptionInput = screen.getByLabelText('Description');

      expect(keyInput).toHaveAttribute('type', 'text');
      expect(keyInput).toHaveAttribute('required');
      expect(keyInput).toHaveAttribute('placeholder', 'e.g., API_URL');

      expect(valueInput).toHaveAttribute('type', 'text');
      expect(valueInput).toHaveAttribute('required');
      expect(valueInput).toHaveAttribute('placeholder', 'e.g., https://api.example.com');

      expect(descriptionInput).toHaveAttribute('type', 'text');
      expect(descriptionInput).toHaveAttribute('placeholder', 'Optional description');
      expect(descriptionInput).not.toHaveAttribute('required');
    });
  });

  describe('Form State Management', () => {
    it('initializes with empty form data', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      expect(screen.getByLabelText('Key *')).toHaveValue('');
      expect(screen.getByLabelText('Value *')).toHaveValue('');
      expect(screen.getByLabelText('Description')).toHaveValue('');
    });

    it('resets form data when modal opens', () => {
      const { rerender } = render(
        <AddVariableModal isOpen={false} onClose={mockOnClose} onAdd={mockOnAdd} />
      );

      rerender(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      expect(screen.getByLabelText('Key *')).toHaveValue('');
      expect(screen.getByLabelText('Value *')).toHaveValue('');
      expect(screen.getByLabelText('Description')).toHaveValue('');
    });

    it('updates form data when inputs change', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      const keyInput = screen.getByLabelText('Key *');
      const valueInput = screen.getByLabelText('Value *');
      const descriptionInput = screen.getByLabelText('Description');

      fireEvent.change(keyInput, { target: { value: 'API_URL' } });
      fireEvent.change(valueInput, { target: { value: 'https://api.example.com' } });
      fireEvent.change(descriptionInput, { target: { value: 'API base URL' } });

      expect(keyInput).toHaveValue('API_URL');
      expect(valueInput).toHaveValue('https://api.example.com');
      expect(descriptionInput).toHaveValue('API base URL');
    });
  });

  describe('Form Validation', () => {
    it('disables submit button when key is empty', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      const submitButton = screen.getByRole('button', { name: 'Add Variable' });
      expect(submitButton).toBeDisabled();

      const valueInput = screen.getByLabelText('Value *');
      fireEvent.change(valueInput, { target: { value: 'some value' } });

      expect(submitButton).toBeDisabled();
    });

    it('disables submit button when value is empty', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      const keyInput = screen.getByLabelText('Key *');
      fireEvent.change(keyInput, { target: { value: 'API_KEY' } });

      const submitButton = screen.getByRole('button', { name: 'Add Variable' });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when both key and value are provided', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      const keyInput = screen.getByLabelText('Key *');
      const valueInput = screen.getByLabelText('Value *');

      fireEvent.change(keyInput, { target: { value: 'API_KEY' } });
      fireEvent.change(valueInput, { target: { value: 'api-value' } });

      const submitButton = screen.getByRole('button', { name: 'Add Variable' });
      expect(submitButton).not.toBeDisabled();
    });

    it('disables submit button when key is only whitespace', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      const keyInput = screen.getByLabelText('Key *');
      const valueInput = screen.getByLabelText('Value *');

      fireEvent.change(keyInput, { target: { value: '   ' } });
      fireEvent.change(valueInput, { target: { value: 'some value' } });

      const submitButton = screen.getByRole('button', { name: 'Add Variable' });
      expect(submitButton).toBeDisabled();
    });

    it('disables submit button when value is only whitespace', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      const keyInput = screen.getByLabelText('Key *');
      const valueInput = screen.getByLabelText('Value *');

      fireEvent.change(keyInput, { target: { value: 'API_KEY' } });
      fireEvent.change(valueInput, { target: { value: '   ' } });

      const submitButton = screen.getByRole('button', { name: 'Add Variable' });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('calls onAdd with form data on successful submit', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      const keyInput = screen.getByLabelText('Key *');
      const valueInput = screen.getByLabelText('Value *');
      const descriptionInput = screen.getByLabelText('Description');

      fireEvent.change(keyInput, { target: { value: 'API_URL' } });
      fireEvent.change(valueInput, { target: { value: 'https://api.example.com' } });
      fireEvent.change(descriptionInput, { target: { value: 'API base URL' } });

      const submitButton = screen.getByRole('button', { name: 'Add Variable' });
      fireEvent.click(submitButton);

      expect(mockOnAdd).toHaveBeenCalledWith({
        key: 'API_URL',
        value: 'https://api.example.com',
        description: 'API base URL',
      });
    });

    it('resets form data after successful submit', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      const keyInput = screen.getByLabelText('Key *');
      const valueInput = screen.getByLabelText('Value *');

      fireEvent.change(keyInput, { target: { value: 'API_KEY' } });
      fireEvent.change(valueInput, { target: { value: 'api-value' } });

      const submitButton = screen.getByRole('button', { name: 'Add Variable' });
      fireEvent.click(submitButton);

      expect(keyInput).toHaveValue('');
      expect(valueInput).toHaveValue('');
    });

    it('submits form with only key and value (description empty)', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      const keyInput = screen.getByLabelText('Key *');
      const valueInput = screen.getByLabelText('Value *');

      fireEvent.change(keyInput, { target: { value: 'API_KEY' } });
      fireEvent.change(valueInput, { target: { value: 'api-value' } });

      const submitButton = screen.getByRole('button', { name: 'Add Variable' });
      fireEvent.click(submitButton);

      expect(mockOnAdd).toHaveBeenCalledWith({
        key: 'API_KEY',
        value: 'api-value',
        description: '',
      });
    });
  });

  describe('Error Display', () => {
    it('displays external error when provided', () => {
      render(
        <AddVariableModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          error="External error message"
        />
      );

      expect(screen.getByText('External error message')).toBeInTheDocument();
      expect(screen.getByText('External error message')).toHaveClass('error-message');
    });

    it('shows external error when no local error', () => {
      render(
        <AddVariableModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          error="External error"
        />
      );

      expect(screen.getByText('External error')).toBeInTheDocument();
    });

    it('does not show error message when no errors', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  describe('Modal Interactions', () => {
    it('calls onClose when overlay is clicked', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      const overlay = document.querySelector('.modal-overlay');
      if (overlay) fireEvent.click(overlay);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('does not call onClose when modal content is clicked', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      const content = document.querySelector('.modal-content');
      if (content) fireEvent.click(content);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('calls onClose when close button (×) is clicked', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      fireEvent.click(screen.getByText('×'));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when Cancel button is clicked', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when Escape key is pressed', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      const form = document.querySelector('form');
      if (form) fireEvent.keyDown(form, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('does not call onClose for other key presses', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      const form = document.querySelector('form');
      if (form) {
        fireEvent.keyDown(form, { key: 'Enter' });
        fireEvent.keyDown(form, { key: 'Tab' });
      }

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles form submission with special characters', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      const keyInput = screen.getByLabelText('Key *');
      const valueInput = screen.getByLabelText('Value *');
      const descriptionInput = screen.getByLabelText('Description');

      fireEvent.change(keyInput, { target: { value: 'API-KEY_123' } });
      fireEvent.change(valueInput, {
        target: { value: 'https://api.example.com/v1?key=test&value=123' },
      });
      fireEvent.change(descriptionInput, { target: { value: 'Special chars: !@#$%^&*()' } });

      const submitButton = screen.getByRole('button', { name: 'Add Variable' });
      fireEvent.click(submitButton);

      expect(mockOnAdd).toHaveBeenCalledWith({
        key: 'API-KEY_123',
        value: 'https://api.example.com/v1?key=test&value=123',
        description: 'Special chars: !@#$%^&*()',
      });
    });

    it('handles unicode characters in inputs', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      const keyInput = screen.getByLabelText('Key *');
      const valueInput = screen.getByLabelText('Value *');
      const descriptionInput = screen.getByLabelText('Description');

      fireEvent.change(keyInput, { target: { value: 'API_中文_KEY' } });
      fireEvent.change(valueInput, { target: { value: 'https://api.example.com/🚀' } });
      fireEvent.change(descriptionInput, { target: { value: 'Description with émojis 🎉' } });

      const submitButton = screen.getByRole('button', { name: 'Add Variable' });
      fireEvent.click(submitButton);

      expect(mockOnAdd).toHaveBeenCalledWith({
        key: 'API_中文_KEY',
        value: 'https://api.example.com/🚀',
        description: 'Description with émojis 🎉',
      });
    });

    it('handles very long input values', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      const longKey = 'A'.repeat(100);
      const longValue = 'V'.repeat(500);
      const longDescription = 'D'.repeat(200);

      const keyInput = screen.getByLabelText('Key *');
      const valueInput = screen.getByLabelText('Value *');
      const descriptionInput = screen.getByLabelText('Description');

      fireEvent.change(keyInput, { target: { value: longKey } });
      fireEvent.change(valueInput, { target: { value: longValue } });
      fireEvent.change(descriptionInput, { target: { value: longDescription } });

      expect(keyInput).toHaveValue(longKey);
      expect(valueInput).toHaveValue(longValue);
      expect(descriptionInput).toHaveValue(longDescription);
    });

    it('maintains form state during interactions', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      const keyInput = screen.getByLabelText('Key *');
      const valueInput = screen.getByLabelText('Value *');

      fireEvent.change(keyInput, { target: { value: 'API_KEY' } });
      fireEvent.change(valueInput, { target: { value: 'api-value' } });

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper form structure', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();

      const keyInput = screen.getByLabelText('Key *');
      const valueInput = screen.getByLabelText('Value *');
      const descriptionInput = screen.getByLabelText('Description');

      expect(keyInput).toHaveAttribute('id', 'key');
      expect(valueInput).toHaveAttribute('id', 'value');
      expect(descriptionInput).toHaveAttribute('id', 'description');
    });

    it('has proper heading hierarchy', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Add New Variable');
    });

    it('has accessible buttons', () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      const submitButton = screen.getByRole('button', { name: 'Add Variable' });
      const closeButton = screen.getByText('×');

      expect(cancelButton).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('completes full form workflow', async () => {
      render(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      const keyInput = screen.getByLabelText('Key *');
      const valueInput = screen.getByLabelText('Value *');

      fireEvent.change(keyInput, { target: { value: 'TEST_KEY' } });
      fireEvent.change(valueInput, { target: { value: 'test_value' } });

      expect(screen.getByRole('button', { name: 'Add Variable' })).not.toBeDisabled();

      const submitButton = screen.getByRole('button', { name: 'Add Variable' });
      fireEvent.click(submitButton);

      expect(mockOnAdd).toHaveBeenCalledWith({
        key: 'TEST_KEY',
        value: 'test_value',
        description: '',
      });

      await waitFor(() => {
        expect(keyInput).toHaveValue('');
        expect(valueInput).toHaveValue('');
      });
    });

    it('handles external error changes', () => {
      const { rerender } = render(
        <AddVariableModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          error="First error"
        />
      );

      expect(screen.getByText('First error')).toBeInTheDocument();

      rerender(
        <AddVariableModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          error="Second error"
        />
      );

      expect(screen.getByText('Second error')).toBeInTheDocument();
      expect(screen.queryByText('First error')).not.toBeInTheDocument();

      rerender(
        <AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} error={null} />
      );

      expect(screen.queryByText('Second error')).not.toBeInTheDocument();
    });

    it('handles modal state transitions', () => {
      const { rerender } = render(
        <AddVariableModal isOpen={false} onClose={mockOnClose} onAdd={mockOnAdd} />
      );

      expect(screen.queryByText('Add New Variable')).not.toBeInTheDocument();

      rerender(<AddVariableModal isOpen={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

      expect(screen.getByText('Add New Variable')).toBeInTheDocument();

      rerender(<AddVariableModal isOpen={false} onClose={mockOnClose} onAdd={mockOnAdd} />);

      expect(screen.queryByText('Add New Variable')).not.toBeInTheDocument();
    });
  });
});
