import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import VariablesComponent from '../variables/VariablesComponent';

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

  it('renders placeholder content', () => {
    render(<VariablesComponent />);

    expect(
      screen.getByText(/Variables management interface will be implemented here/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This is a placeholder page for the variables route/)
    ).toBeInTheDocument();
  });
});
