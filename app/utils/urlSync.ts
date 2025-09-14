import type { HttpMethod, HeaderItem } from '../types/interfaces';

export interface RequestState {
  method: HttpMethod;
  url: string;
  headers: HeaderItem[];
  bodyType: 'json' | 'text';
  bodyContent: string;
}

export function encodeRequestState(state: RequestState): string {
  try {
    const stateString = JSON.stringify(state);
    return btoa(encodeURIComponent(stateString));
  } catch (error) {
    console.error('Error encoding request state:', error);
    return '';
  }
}

export function decodeRequestState(encodedState: string): RequestState | null {
  try {
    const stateString = decodeURIComponent(atob(encodedState));
    return JSON.parse(stateString) as RequestState;
  } catch (error) {
    console.error('Error decoding request state:', error);
    return null;
  }
}

export function getRequestStateFromUrl(): RequestState | null {
  if (typeof window === 'undefined') return null;

  const urlParams = new URLSearchParams(window.location.search);
  const encodedState = urlParams.get('state');

  if (!encodedState) return null;

  return decodeRequestState(encodedState);
}

export function updateUrlWithRequestState(state: RequestState): void {
  if (typeof window === 'undefined') return;

  const encodedState = encodeRequestState(state);
  const url = new URL(window.location.href);

  if (encodedState) {
    url.searchParams.set('state', encodedState);
  } else {
    url.searchParams.delete('state');
  }

  window.history.replaceState({}, '', url.toString());
}
