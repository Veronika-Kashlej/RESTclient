import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import CodeGenerator from '../components/codeGenerator/CodeGenerator';

vi.mock('../utils/codeGenerator', () => ({
  generateCode: vi.fn((data, lang) => `Generated ${lang} code for ${data.method} ${data.url}`),
  getSupportedLanguages: vi.fn(() => [
    { value: 'curl', label: 'cURL' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
  ]),
}));

Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe('CodeGenerator Component', () => {
  const defaultProps = {
    method: 'GET' as const,
    url: 'https://api.example.com',
    headers: [{ id: '1', key: 'Authorization', value: 'Bearer token' }],
    bodyContent: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders code generator with default language', () => {
    render(<CodeGenerator {...defaultProps} />);

    expect(screen.getByText('Generated Code')).toBeInTheDocument();
    expect(screen.getByTestId('language-selector')).toBeInTheDocument();
    expect(screen.getByTestId('generated-code')).toBeInTheDocument();
  });

  it('shows message when URL is empty', () => {
    render(<CodeGenerator {...defaultProps} url="" />);

    expect(screen.getByText('Please enter a URL to generate code')).toBeInTheDocument();
    expect(screen.queryByTestId('copy-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('generated-code')).not.toBeInTheDocument();
  });

  it('shows copy button when URL is provided', () => {
    render(<CodeGenerator {...defaultProps} />);

    expect(screen.getByTestId('copy-button')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('changes language when selector is changed', () => {
    render(<CodeGenerator {...defaultProps} />);

    const selector = screen.getByTestId('language-selector');
    fireEvent.change(selector, { target: { value: 'python' } });

    expect(screen.getByTestId('generated-code')).toHaveTextContent(
      'Generated python code for GET https://api.example.com'
    );
  });

  it('copies code to clipboard when copy button is clicked', async () => {
    const mockWriteText = vi.mocked(navigator.clipboard.writeText);
    render(<CodeGenerator {...defaultProps} />);

    const copyButton = screen.getByTestId('copy-button');
    fireEvent.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith(
      'Generated curl code for GET https://api.example.com'
    );
  });

  it('handles clipboard copy error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockWriteText = vi.mocked(navigator.clipboard.writeText);
    mockWriteText.mockRejectedValue(new Error('Clipboard error'));

    render(<CodeGenerator {...defaultProps} />);

    const copyButton = screen.getByTestId('copy-button');
    fireEvent.click(copyButton);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(consoleSpy).toHaveBeenCalledWith('Failed to copy code:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('displays generated code correctly', () => {
    render(<CodeGenerator {...defaultProps} />);

    expect(screen.getByTestId('generated-code')).toHaveTextContent(
      'Generated curl code for GET https://api.example.com'
    );
  });

  it('renders language options correctly', () => {
    render(<CodeGenerator {...defaultProps} />);

    const selector = screen.getByTestId('language-selector');
    expect(selector).toBeInTheDocument();

    expect(screen.getByText('cURL')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
  });

  it('updates generated code when props change', () => {
    const { rerender } = render(<CodeGenerator {...defaultProps} />);

    expect(screen.getByTestId('generated-code')).toHaveTextContent(
      'Generated curl code for GET https://api.example.com'
    );

    rerender(
      <CodeGenerator
        {...defaultProps}
        method="POST"
        url="https://api.example.com/users"
        bodyContent='{"name": "test"}'
      />
    );

    expect(screen.getByTestId('generated-code')).toHaveTextContent(
      'Generated curl code for POST https://api.example.com/users'
    );
  });

  it('handles different HTTP methods', () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE'] as const;

    methods.forEach((method) => {
      const { unmount } = render(<CodeGenerator {...defaultProps} method={method} />);

      expect(screen.getByTestId('generated-code')).toHaveTextContent(
        `Generated curl code for ${method} https://api.example.com`
      );

      unmount();
    });
  });
});
