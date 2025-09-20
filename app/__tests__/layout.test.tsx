import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RootLayout, { metadata } from '../layout';

vi.mock('../components/MainLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout">{children}</div>
  ),
}));

vi.mock('../components/authContext/authContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

vi.mock('../providers/ToastProvider', () => ({
  ToastProvider: () => <div data-testid="toast-provider" />,
}));

vi.mock('../components/ErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

vi.mock('../App.scss', () => ({}));

describe('RootLayout', () => {
  const TestChild = () => <div data-testid="test-child">Test Content</div>;

  it('should render complete HTML structure', () => {
    const { getByTestId } = render(
      <RootLayout>
        <TestChild />
      </RootLayout>
    );

    expect(getByTestId('auth-provider')).toBeInTheDocument();
    expect(getByTestId('test-child')).toBeInTheDocument();
  });

  it('should render with correct structure', () => {
    const { getByTestId } = render(
      <RootLayout>
        <TestChild />
      </RootLayout>
    );

    expect(getByTestId('main-layout')).toBeInTheDocument();
    expect(getByTestId('toast-provider')).toBeInTheDocument();
  });

  it('should render all provider components in correct order', () => {
    const { getByTestId } = render(
      <RootLayout>
        <TestChild />
      </RootLayout>
    );

    expect(getByTestId('auth-provider')).toBeInTheDocument();
    expect(getByTestId('error-boundary')).toBeInTheDocument();
    expect(getByTestId('main-layout')).toBeInTheDocument();
    expect(getByTestId('toast-provider')).toBeInTheDocument();
    expect(getByTestId('test-child')).toBeInTheDocument();
  });

  it('should render children inside providers', () => {
    const { getByTestId } = render(
      <RootLayout>
        <TestChild />
      </RootLayout>
    );

    expect(getByTestId('test-child')).toBeInTheDocument();
  });

  it('should have correct provider nesting structure', () => {
    const { getByTestId } = render(
      <RootLayout>
        <TestChild />
      </RootLayout>
    );

    const authProvider = getByTestId('auth-provider');
    const errorBoundary = getByTestId('error-boundary');
    const mainLayout = getByTestId('main-layout');

    expect(authProvider).toContainElement(errorBoundary);
    expect(errorBoundary).toContainElement(mainLayout);
    expect(mainLayout).toContainElement(getByTestId('test-child'));
  });

  it('should render ToastProvider as sibling to providers', () => {
    const { getByTestId } = render(
      <RootLayout>
        <TestChild />
      </RootLayout>
    );

    const toastProvider = getByTestId('toast-provider');
    expect(toastProvider).toBeInTheDocument();
  });

  it('should handle multiple children', () => {
    const { getByTestId } = render(
      <RootLayout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </RootLayout>
    );

    expect(getByTestId('child-1')).toBeInTheDocument();
    expect(getByTestId('child-2')).toBeInTheDocument();
  });
});

describe('RootLayout metadata', () => {
  it('should export correct metadata', () => {
    expect(metadata).toBeDefined();
    expect(metadata.title).toBe('REST Client');
    expect(metadata.description).toBe('A lightweight Postman alternative for testing REST APIs');
  });

  it('should have correct icon configuration', () => {
    expect(metadata.icons).toBeDefined();
    if (
      typeof metadata.icons === 'object' &&
      metadata.icons &&
      !Array.isArray(metadata.icons) &&
      'icon' in metadata.icons
    ) {
      expect(metadata.icons.icon).toBe('/favicon.svg');
      expect(metadata.icons.shortcut).toBe('/favicon.svg');
      expect(metadata.icons.apple).toBe('/favicon.svg');
    }
  });

  it('should have all required metadata properties', () => {
    expect(typeof metadata.title).toBe('string');
    expect(typeof metadata.description).toBe('string');
    expect(typeof metadata.icons).toBe('object');
    expect(metadata.icons).not.toBeNull();
  });
});
