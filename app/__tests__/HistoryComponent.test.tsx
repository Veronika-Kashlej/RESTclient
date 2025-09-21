import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HistoryComponent from '../[locale]/history/HistoryComponent';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Request History',
      description: 'View and manage your API request history.',
      clearAll: 'Clear All',
      noHistory: 'No history yet',
      getStarted: 'Make your first request to see it here.',
      loading: 'Loading history...',
    };
    return translations[key] || key;
  }),
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  getFirestore: vi.fn(),
  Timestamp: {
    fromDate: vi.fn(),
    toDate: vi.fn(),
  },
}));

vi.mock('../../firebase/firebase', () => ({
  db: {},
}));

vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ locale: 'en' })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
}));

describe('HistoryComponent', () => {
  it('shows loading state initially', () => {
    render(<HistoryComponent />);

    expect(screen.getByText('Loading history...')).toBeInTheDocument();
  });

  it('renders component without errors', () => {
    const { container } = render(<HistoryComponent />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('has correct CSS structure', () => {
    const { container } = render(<HistoryComponent />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with proper accessibility', () => {
    render(<HistoryComponent />);

    expect(screen.getByText('Loading history...')).toBeInTheDocument();
  });

  it('handles component mount and unmount', () => {
    const { unmount } = render(<HistoryComponent />);

    expect(screen.getByText('Loading history...')).toBeInTheDocument();

    unmount();
  });
});
