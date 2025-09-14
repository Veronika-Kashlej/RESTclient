import { useEffect, useCallback } from 'react';
import type { RequestState } from '../utils/urlSync';
import { getRequestStateFromUrl, updateUrlWithRequestState } from '../utils/urlSync';

export function useUrlSync(
  state: RequestState,
  onStateRestore: (restoredState: RequestState) => void
) {
  useEffect(() => {
    const restoredState = getRequestStateFromUrl();
    if (restoredState) {
      onStateRestore(restoredState);
    }
  }, [onStateRestore]);

  const updateUrl = useCallback(() => {
    updateUrlWithRequestState(state);
  }, [state]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  return {
    updateUrl,
  };
}
