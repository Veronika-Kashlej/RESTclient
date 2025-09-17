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
});
