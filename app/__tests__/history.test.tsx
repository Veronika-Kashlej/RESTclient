import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HistoryComponent from '../[locale]/history/HistoryComponent';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Request History',
      description: 'View and manage your API request history.',
      loading: 'Loading...',
    };
    return translations[key] || key;
  }),
}));

vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ locale: 'en' })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  })),
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  getFirestore: vi.fn(),
  Timestamp: {
    fromDate: vi.fn(),
  },
}));

vi.mock('../../firebase/firebase', () => ({
  db: {},
}));

describe('History Component', () => {
  it('renders history title', () => {
    render(<HistoryComponent />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders history description', () => {
    render(<HistoryComponent />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders loading state initially', () => {
    render(<HistoryComponent />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
