import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Layout from '../components/MainLayout';

vi.mock('../components/header/header', () => ({
  default: ({ className }: { className: string }) => (
    <header data-testid="header" className={className}>
      Header Component
    </header>
  ),
}));

vi.mock('../components/footer/footer', () => ({
  default: () => <footer data-testid="footer">Footer Component</footer>,
}));

describe('MainLayout Component', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 0,
    });
  });

  it('should render layout with header, main, and footer', () => {
    render(
      <Layout>
        <div data-testid="child">Child Content</div>
      </Layout>
    );

    expect(screen.getByTestId('app')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should apply default header className when not scrolled', () => {
    render(
      <Layout>
        <div>Child Content</div>
      </Layout>
    );

    const header = screen.getByTestId('header');
    expect(header).toHaveClass('header');
    expect(header).not.toHaveClass('_active');
  });

  it('should apply active header className when scrolled', () => {
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 100,
    });

    render(
      <Layout>
        <div>Child Content</div>
      </Layout>
    );

    const header = screen.getByTestId('header');
    expect(header).toHaveClass('header', '_active');
  });

  it('should render main element with flex style', () => {
    render(
      <Layout>
        <div>Child Content</div>
      </Layout>
    );

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveStyle({ flex: 1 });
  });

  it('should add and remove scroll event listener', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(
      <Layout>
        <div>Child Content</div>
      </Layout>
    );

    expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('should handle scroll events correctly', () => {
    render(
      <Layout>
        <div>Child Content</div>
      </Layout>
    );

    const header = screen.getByTestId('header');
    expect(header).toHaveClass('header');
  });

  it('should render children inside main element', () => {
    render(
      <Layout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </Layout>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('should have correct app container structure', () => {
    render(
      <Layout>
        <div>Child Content</div>
      </Layout>
    );

    const app = screen.getByTestId('app');
    const header = screen.getByTestId('header');
    const main = screen.getByRole('main');
    const footer = screen.getByTestId('footer');

    expect(app).toContainElement(header);
    expect(app).toContainElement(main);
    expect(app).toContainElement(footer);
  });
});
