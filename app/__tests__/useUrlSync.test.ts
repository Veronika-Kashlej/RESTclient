import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useUrlSync } from '../hooks/useUrlSync';
import type { RequestState } from '../types/interfaces';
import * as urlSync from '../utils/urlSync';

vi.mock('../utils/urlSync', () => ({
  getRequestStateFromUrl: vi.fn(),
  updateUrlWithRequestState: vi.fn(),
}));

describe('useUrlSync Hook', () => {
  const mockGetRequestStateFromUrl = vi.mocked(urlSync.getRequestStateFromUrl);
  const mockUpdateUrlWithRequestState = vi.mocked(urlSync.updateUrlWithRequestState);
  const mockOnStateRestore = vi.fn();

  const defaultState: RequestState = {
    method: 'GET',
    url: 'https://api.example.com',
    headers: [],
    bodyType: 'json',
    bodyContent: '',
    response: null,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    const mockAddEventListener = vi.fn();
    const mockRemoveEventListener = vi.fn();
    Object.defineProperty(window, 'addEventListener', {
      value: mockAddEventListener,
      writable: true,
    });
    Object.defineProperty(window, 'removeEventListener', {
      value: mockRemoveEventListener,
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should restore state from URL on initial load', () => {
    const restoredState: RequestState = {
      ...defaultState,
      method: 'POST',
      url: 'https://restored.com',
    };

    mockGetRequestStateFromUrl.mockReturnValue(restoredState);

    renderHook(() => useUrlSync(defaultState, mockOnStateRestore));

    expect(mockGetRequestStateFromUrl).toHaveBeenCalled();
    expect(mockOnStateRestore).toHaveBeenCalledWith(restoredState);
  });

  it('should not restore state if URL has no state', () => {
    mockGetRequestStateFromUrl.mockReturnValue(null);

    renderHook(() => useUrlSync(defaultState, mockOnStateRestore));

    expect(mockGetRequestStateFromUrl).toHaveBeenCalled();
    expect(mockOnStateRestore).not.toHaveBeenCalled();
  });

  it('should add popstate event listener', () => {
    const mockAddEventListener = vi.mocked(window.addEventListener);

    renderHook(() => useUrlSync(defaultState, mockOnStateRestore));

    expect(mockAddEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
  });

  it('should remove popstate event listener on unmount', () => {
    const mockRemoveEventListener = vi.mocked(window.removeEventListener);

    const { unmount } = renderHook(() => useUrlSync(defaultState, mockOnStateRestore));

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
  });

  it('should handle popstate events', () => {
    const restoredState: RequestState = {
      ...defaultState,
      method: 'PUT',
      url: 'https://popstate.com',
    };

    let popstateHandler: (() => void) | undefined;
    const mockAddEventListener = vi.mocked(window.addEventListener);
    mockAddEventListener.mockImplementation((event, handler) => {
      if (event === 'popstate') {
        popstateHandler = handler as () => void;
      }
    });

    mockGetRequestStateFromUrl.mockReturnValueOnce(null);
    mockGetRequestStateFromUrl.mockReturnValueOnce(restoredState);

    renderHook(() => useUrlSync(defaultState, mockOnStateRestore));

    act(() => {
      if (popstateHandler) {
        popstateHandler();
      }
    });

    expect(mockOnStateRestore).toHaveBeenCalledWith(restoredState);
  });

  it('should not update URL immediately on initial load but may update after effects run', async () => {
    mockGetRequestStateFromUrl.mockReturnValue(null);

    renderHook(() => useUrlSync(defaultState, mockOnStateRestore));

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockUpdateUrlWithRequestState).toHaveBeenCalled();
  });

  it('should update URL when state changes after initial load', async () => {
    mockGetRequestStateFromUrl.mockReturnValue(null);

    const { rerender } = renderHook(({ state }) => useUrlSync(state, mockOnStateRestore), {
      initialProps: { state: defaultState },
    });

    const newState: RequestState = {
      ...defaultState,
      method: 'POST',
    };

    rerender({ state: newState });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockUpdateUrlWithRequestState).toHaveBeenCalledWith(newState);
  });

  it('should debounce URL updates', async () => {
    mockGetRequestStateFromUrl.mockReturnValue(null);

    const { rerender } = renderHook(({ state }) => useUrlSync(state, mockOnStateRestore), {
      initialProps: { state: defaultState },
    });

    const state1: RequestState = { ...defaultState, method: 'POST' };
    const state2: RequestState = { ...defaultState, method: 'PUT' };
    const state3: RequestState = { ...defaultState, method: 'DELETE' };

    rerender({ state: state1 });
    rerender({ state: state2 });
    rerender({ state: state3 });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(mockUpdateUrlWithRequestState).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(mockUpdateUrlWithRequestState).toHaveBeenCalledTimes(1);
    expect(mockUpdateUrlWithRequestState).toHaveBeenCalledWith(state3);
  });

  it('should clear timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    mockGetRequestStateFromUrl.mockReturnValue(null);

    const { rerender, unmount } = renderHook(({ state }) => useUrlSync(state, mockOnStateRestore), {
      initialProps: { state: defaultState },
    });

    const newState: RequestState = { ...defaultState, method: 'POST' };
    rerender({ state: newState });

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('should track URL updates properly', async () => {
    mockGetRequestStateFromUrl.mockReturnValue(null);

    const { rerender } = renderHook(({ state }) => useUrlSync(state, mockOnStateRestore), {
      initialProps: { state: defaultState },
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    const initialCallCount = mockUpdateUrlWithRequestState.mock.calls.length;

    const newState = { ...defaultState, method: 'POST' as const };
    rerender({ state: newState });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockUpdateUrlWithRequestState.mock.calls.length).toBeGreaterThan(initialCallCount);
    expect(mockUpdateUrlWithRequestState).toHaveBeenLastCalledWith(newState);
  });

  it('should return updateUrl function', () => {
    mockGetRequestStateFromUrl.mockReturnValue(null);

    const { result } = renderHook(() => useUrlSync(defaultState, mockOnStateRestore));

    expect(result.current).toHaveProperty('updateUrl');
    expect(typeof result.current.updateUrl).toBe('function');
  });

  it('should handle base64 encoding correctly', () => {
    const restoredState: RequestState = {
      ...defaultState,
      method: 'POST',
      url: 'https://test.com',
    };

    mockGetRequestStateFromUrl.mockReturnValue(restoredState);

    const { rerender } = renderHook(({ state }) => useUrlSync(state, mockOnStateRestore), {
      initialProps: { state: defaultState },
    });

    const newState: RequestState = {
      ...defaultState,
      method: 'PUT',
    };

    rerender({ state: newState });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockUpdateUrlWithRequestState).toHaveBeenCalledWith(newState);
  });

  it('should handle multiple onStateRestore calls correctly', () => {
    const restoredState1: RequestState = {
      ...defaultState,
      method: 'POST',
    };

    const restoredState2: RequestState = {
      ...defaultState,
      method: 'PUT',
    };

    let popstateHandler: (() => void) | undefined;
    const mockAddEventListener = vi.mocked(window.addEventListener);
    mockAddEventListener.mockImplementation((event, handler) => {
      if (event === 'popstate') {
        popstateHandler = handler as () => void;
      }
    });

    mockGetRequestStateFromUrl.mockReturnValueOnce(restoredState1);
    mockGetRequestStateFromUrl.mockReturnValueOnce(restoredState2);

    renderHook(() => useUrlSync(defaultState, mockOnStateRestore));

    act(() => {
      if (popstateHandler) {
        popstateHandler();
      }
    });

    expect(mockOnStateRestore).toHaveBeenCalledTimes(2);
    expect(mockOnStateRestore).toHaveBeenNthCalledWith(1, restoredState1);
    expect(mockOnStateRestore).toHaveBeenNthCalledWith(2, restoredState2);
  });
});
