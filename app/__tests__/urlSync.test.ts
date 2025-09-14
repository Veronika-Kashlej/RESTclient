import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  encodeRequestState,
  decodeRequestState,
  getRequestStateFromUrl,
  updateUrlWithRequestState,
} from '../utils/urlSync';
import type { RequestState } from '../utils/urlSync';

const mockWindow = {
  location: {
    href: 'http://localhost:3000/client',
    search: '',
  },
  history: {
    replaceState: vi.fn(),
  },
  btoa: (str: string) => Buffer.from(str, 'binary').toString('base64'),
  atob: (str: string) => Buffer.from(str, 'base64').toString('binary'),
  encodeURIComponent: (str: string) => encodeURIComponent(str),
  decodeURIComponent: (str: string) => decodeURIComponent(str),
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

describe('URL Sync utilities', () => {
  const mockRequestState: RequestState = {
    method: 'POST',
    url: 'https://api.example.com/test',
    headers: [
      { id: '1', key: 'Content-Type', value: 'application/json' },
      { id: '2', key: 'Authorization', value: 'Bearer token123' },
    ],
    bodyType: 'json',
    bodyContent: '{"test": "data"}',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockWindow.location.search = '';
  });

  describe('encodeRequestState', () => {
    it('should encode request state to base64', () => {
      const encoded = encodeRequestState(mockRequestState);
      expect(encoded).toBeTruthy();
      expect(typeof encoded).toBe('string');
    });

    it('should handle empty state', () => {
      const emptyState: RequestState = {
        method: 'GET',
        url: '',
        headers: [],
        bodyType: 'json',
        bodyContent: '',
      };
      const encoded = encodeRequestState(emptyState);
      expect(encoded).toBeTruthy();
    });
  });

  describe('decodeRequestState', () => {
    it('should decode base64 to request state', () => {
      const encoded = encodeRequestState(mockRequestState);
      const decoded = decodeRequestState(encoded);

      expect(decoded).toEqual(mockRequestState);
    });

    it('should return null for invalid base64', () => {
      const decoded = decodeRequestState('invalid-base64');
      expect(decoded).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      const invalidJson = mockWindow.btoa('invalid-json');
      const decoded = decodeRequestState(invalidJson);
      expect(decoded).toBeNull();
    });
  });

  describe('getRequestStateFromUrl', () => {
    it('should return null when no state in URL', () => {
      const state = getRequestStateFromUrl();
      expect(state).toBeNull();
    });

    it('should return decoded state from URL', () => {
      const encoded = encodeRequestState(mockRequestState);
      mockWindow.location.search = `?state=${encoded}`;

      const state = getRequestStateFromUrl();
      expect(state).toEqual(mockRequestState);
    });
  });

  describe('updateUrlWithRequestState', () => {
    it('should update URL with encoded state', () => {
      updateUrlWithRequestState(mockRequestState);

      expect(mockWindow.history.replaceState).toHaveBeenCalled();
    });

    it('should remove state from URL when state is empty', () => {
      const emptyState: RequestState = {
        method: 'GET',
        url: '',
        headers: [],
        bodyType: 'json',
        bodyContent: '',
      };

      updateUrlWithRequestState(emptyState);

      expect(mockWindow.history.replaceState).toHaveBeenCalled();
    });
  });
});
