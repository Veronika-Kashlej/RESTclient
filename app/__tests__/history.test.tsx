import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HistoryComponent from '../history/HistoryComponent';
import {
  getDocs,
  collection,
  query,
  orderBy,
  QuerySnapshot,
  QueryDocumentSnapshot,
} from 'firebase/firestore';

vi.mock('../firebase/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  Timestamp: {
    now: vi.fn(() => ({ seconds: 1234567890, nanoseconds: 0 })),
    fromDate: vi.fn(),
  },
}));

describe('HistoryComponent', () => {
  const createMockDoc = (request: {
    id: string;
    method: string;
    url: string;
    status: number;
    timingMs: number;
    requestSizeBytes: number;
    responseSizeBytes: number;
    timestamp: { seconds: number; nanoseconds: number };
  }): QueryDocumentSnapshot => ({
    id: request.id,
    data: () => ({
      method: request.method,
      url: request.url,
      status: request.status,
      timingMs: request.timingMs,
      requestSizeBytes: request.requestSizeBytes,
      responseSizeBytes: request.responseSizeBytes,
      timestamp: request.timestamp,
    }),
    metadata: {} as never,
    exists: (() => true) as () => this is QueryDocumentSnapshot,
    get: vi.fn(),
    toJSON: vi.fn(),
    ref: {} as never,
  });

  const createMockSnapshot = (docs: QueryDocumentSnapshot[]): QuerySnapshot => ({
    docs,
    metadata: {} as never,
    query: {} as never,
    size: docs.length,
    empty: docs.length === 0,
    forEach: vi.fn(),
    docChanges: vi.fn(),
    toJSON: vi.fn(),
  });

  const mockRequests = [
    {
      id: '1',
      method: 'GET',
      url: 'https://api.example.com/users',
      status: 200,
      timingMs: 150.25,
      requestSizeBytes: 0,
      responseSizeBytes: 1024,
      timestamp: { seconds: 1234567890, nanoseconds: 0 },
    },
    {
      id: '2',
      method: 'POST',
      url: 'https://api.example.com/posts',
      status: 201,
      timingMs: 300.75,
      requestSizeBytes: 256,
      responseSizeBytes: 512,
      timestamp: { seconds: 1234567890, nanoseconds: 0 },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', async () => {
    vi.mocked(getDocs).mockImplementation(() => new Promise(() => {}));

    render(<HistoryComponent />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display requests after successful fetch', async () => {
    const mockDocs = mockRequests.map(createMockDoc);
    const mockSnapshot = createMockSnapshot(mockDocs);
    vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

    render(<HistoryComponent />);

    await waitFor(() => {
      expect(screen.getByText('Request History')).toBeInTheDocument();
    });

    expect(screen.getByText('GET')).toBeInTheDocument();
    expect(screen.getByText('POST')).toBeInTheDocument();
    expect(screen.getByText('https://api.example.com/users')).toBeInTheDocument();
    expect(screen.getByText('https://api.example.com/posts')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('201')).toBeInTheDocument();
    expect(screen.getByText('150.25 ms')).toBeInTheDocument();
    expect(screen.getByText('300.75 ms')).toBeInTheDocument();
  });

  it('should display error message when fetch fails', async () => {
    vi.mocked(getDocs).mockRejectedValue(new Error('Firebase error'));

    render(<HistoryComponent />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load requests')).toBeInTheDocument();
    });

    expect(screen.queryByText('Request History')).not.toBeInTheDocument();
  });

  it('should display no requests message when list is empty', async () => {
    const mockSnapshot = createMockSnapshot([]);
    vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

    render(<HistoryComponent />);

    await waitFor(() => {
      expect(screen.getByText('Request History')).toBeInTheDocument();
    });

    expect(screen.getByText('No requests found.')).toBeInTheDocument();
  });

  it('should call Firebase with correct query parameters', async () => {
    const mockSnapshot = createMockSnapshot([]);
    vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

    render(<HistoryComponent />);

    await waitFor(() => {
      expect(vi.mocked(collection)).toHaveBeenCalledWith({}, 'requests');
      expect(vi.mocked(orderBy)).toHaveBeenCalledWith('timestamp', 'desc');
      expect(vi.mocked(query)).toHaveBeenCalled();
      expect(vi.mocked(getDocs)).toHaveBeenCalled();
    });
  });

  it('should display all request details correctly', async () => {
    const singleRequest = [
      {
        id: 'test-id',
        method: 'PUT',
        url: 'https://test.com/api',
        status: 404,
        timingMs: 75.5,
        requestSizeBytes: 128,
        responseSizeBytes: 64,
        timestamp: { seconds: 1234567890, nanoseconds: 0 },
      },
    ];

    const mockDocs = singleRequest.map(createMockDoc);
    const mockSnapshot = createMockSnapshot(mockDocs);
    vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

    render(<HistoryComponent />);

    await waitFor(() => {
      expect(screen.getByText('Request History')).toBeInTheDocument();
    });

    expect(screen.getByText('method:')).toBeInTheDocument();
    expect(screen.getByText('PUT')).toBeInTheDocument();
    expect(screen.getByText('url:')).toBeInTheDocument();
    expect(screen.getByText('https://test.com/api')).toBeInTheDocument();
    expect(screen.getByText('status:')).toBeInTheDocument();
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('timingMs:')).toBeInTheDocument();
    expect(screen.getByText('75.50 ms')).toBeInTheDocument();
    expect(screen.getByText('requestSizeBytes:')).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument();
    expect(screen.getByText('responseSizeBytes:')).toBeInTheDocument();
    expect(screen.getByText('64')).toBeInTheDocument();
  });

  it('should render placeholder content', async () => {
    const mockSnapshot = createMockSnapshot([]);
    vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

    render(<HistoryComponent />);

    await waitFor(() => {
      expect(screen.getByText('Request History')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Request history interface will be implemented here.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('This is a placeholder page for the history route.')
    ).toBeInTheDocument();
  });

  it('should handle multiple requests and display them in list', async () => {
    const mockDocs = mockRequests.map(createMockDoc);
    const mockSnapshot = createMockSnapshot(mockDocs);
    vi.mocked(getDocs).mockResolvedValue(mockSnapshot);

    render(<HistoryComponent />);

    await waitFor(() => {
      expect(screen.getByText('Request History')).toBeInTheDocument();
    });

    const historyList = screen.getByRole('list');
    expect(historyList).toBeInTheDocument();
    expect(historyList).toHaveClass('history-content');

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(2);
  });
});
