import { useEffect, useCallback, useRef } from 'react';
import type { RequestState } from '../utils/urlSync';
import { getRequestStateFromUrl, updateUrlWithRequestState } from '../utils/urlSync';

export function useUrlSync(
  state: RequestState,
  onStateRestore: (restoredState: RequestState) => void
) {
  const isInitialLoad = useRef(true);
  const lastSavedState = useRef<string>('');
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const restoredState = getRequestStateFromUrl();
    if (restoredState) {
      onStateRestore(restoredState);
      lastSavedState.current = btoa(JSON.stringify(restoredState));
    }
    isInitialLoad.current = false;
  }, [onStateRestore]);

  useEffect(() => {
    const handlePopState = () => {
      const restoredState = getRequestStateFromUrl();
      if (restoredState) {
        onStateRestore(restoredState);
        lastSavedState.current = btoa(JSON.stringify(restoredState));
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onStateRestore]);

  const updateUrl = useCallback(() => {
    if (isInitialLoad.current) return;

    const currentState = btoa(JSON.stringify(state));
    const timePause = 300;
    if (currentState !== lastSavedState.current) {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        updateUrlWithRequestState(state);
        lastSavedState.current = currentState;
      }, timePause);
    }
  }, [state]);

  useEffect(() => {
    updateUrl();

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [updateUrl]);

  return {
    updateUrl,
  };
}
