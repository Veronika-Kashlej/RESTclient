import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VariablesComponent from '../[locale]/variables/VariablesComponent';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Environment Variables',
    };
    return translations[key] || key;
  }),
}));

describe('Variables Component', () => {
  it('renders variables title', () => {
    render(<VariablesComponent />);

    expect(screen.getByText('Environment Variables')).toBeInTheDocument();
  });

  it('renders variables description', () => {
    render(<VariablesComponent />);

    expect(
      screen.getByText(/Manage your environment variables and configurations/)
    ).toBeInTheDocument();
  });
});
