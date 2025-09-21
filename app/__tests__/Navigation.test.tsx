import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Navigation from '../components/Navigation';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/en'),
  useParams: vi.fn(() => ({ locale: 'en' })),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      home: 'Home',
      client: 'Client',
      history: 'History',
      variables: 'Variables',
    };
    return translations[key] || key;
  }),
}));

describe('Navigation Component', () => {
  it('renders navigation with correct test id', () => {
    render(<Navigation />);

    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    render(<Navigation />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Variables')).toBeInTheDocument();
  });

  it('renders navigation links with correct href attributes', () => {
    render(<Navigation />);

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/en');
    expect(screen.getByRole('link', { name: 'Client' })).toHaveAttribute('href', '/en/client');
    expect(screen.getByRole('link', { name: 'History' })).toHaveAttribute('href', '/en/history');
    expect(screen.getByRole('link', { name: 'Variables' })).toHaveAttribute(
      'href',
      '/en/variables'
    );
  });

  it('renders navigation list structure', () => {
    render(<Navigation />);

    const navList = screen.getByRole('list');
    expect(navList).toBeInTheDocument();
    expect(navList).toHaveClass('navigation__list');

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(4);
  });
});
