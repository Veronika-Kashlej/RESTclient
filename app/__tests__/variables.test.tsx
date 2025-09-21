import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VariablesComponent from '../[locale]/variables/VariablesComponent';

vi.mock('../hooks/useVariables', () => ({
  useVariables: vi.fn(() => ({
    variables: [],
    loading: false,
    error: null,
    addVariable: vi.fn(),
    updateVariable: vi.fn(),
    deleteVariable: vi.fn(),
    clearError: vi.fn(),
  })),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Variables',
      description: 'Manage your environment variables and configurations',
      descriptionColumn: 'Description',
      name: 'Name',
      value: 'Value',
      actions: 'Actions',
      addVariable: 'Add Variable',
      noVariables: 'No variables created yet',
      createFirst: 'Create your first variable to use in requests',
      loading: 'Loading variables...',
    };
    return translations[key] || key;
  }),
}));

describe('Variables Component', () => {
  it('renders variables title', () => {
    render(<VariablesComponent />);

    expect(screen.getByText('Variables')).toBeInTheDocument();
  });

  it('renders variables description', () => {
    render(<VariablesComponent />);

    expect(
      screen.getByText(/Manage your environment variables and configurations/)
    ).toBeInTheDocument();
  });
});
