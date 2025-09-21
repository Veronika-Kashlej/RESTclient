import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Footer from '../components/footer/footer';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
    ...props
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
  }) => <img src={src} alt={alt} width={width} height={height} {...props} />,
}));

vi.mock('../../assets/rss-logo.svg', () => ({
  default: 'mocked-rss-logo.svg',
}));

describe('Footer Component', () => {
  it('should render footer with correct test id', () => {
    render(<Footer />);

    const footer = screen.getByTestId('footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('footer');
  });

  it('should render GitHub repository link', () => {
    render(<Footer />);

    const githubLink = screen.getByText('rest-client-app');
    expect(githubLink).toBeInTheDocument();
    expect(githubLink.closest('a')).toHaveAttribute(
      'href',
      'https://github.com/Veronika-Kashlej/rest-client-app/tree/main'
    );
    expect(githubLink.closest('a')).toHaveAttribute('target', '_blank');
    expect(githubLink.closest('a')).toHaveAttribute('rel', 'noreferrer');
  });

  it('should render year', () => {
    render(<Footer />);

    const year = screen.getByText('2025');
    expect(year).toBeInTheDocument();
    expect(year).toHaveClass('h4');
  });

  it('should render RSS School logo with correct link', () => {
    render(<Footer />);

    const logo = screen.getByAltText('404 error');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('width', '80');
    expect(logo).toHaveAttribute('height', '80');

    const logoLink = logo.closest('a');
    expect(logoLink).toHaveAttribute('href', 'https://rs.school/courses/reactjs');
    expect(logoLink).toHaveAttribute('target', '_blank');
    expect(logoLink).toHaveAttribute('rel', 'noreferrer');
  });

  it('should render all footer elements', () => {
    render(<Footer />);

    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByText('rest-client-app')).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();
    expect(screen.getByAltText('404 error')).toBeInTheDocument();
  });

  it('should have correct CSS classes', () => {
    render(<Footer />);

    const footer = screen.getByTestId('footer');
    const githubLink = screen.getByText('rest-client-app').closest('a');
    const year = screen.getByText('2025');

    expect(footer).toHaveClass('footer');
    expect(githubLink).toHaveClass('h3');
    expect(year).toHaveClass('h4');
  });
});
