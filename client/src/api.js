import { useEffect, useState } from 'react';

export async function api(path, { method = 'GET', body, signal } = {}) {
  const form = body instanceof FormData;
  const headers = method === 'GET' ? {} : { 'X-Alzikrayat-Request': '1' };
  if (body && !form) headers['Content-Type'] = 'application/json';
  const response = await fetch('/api' + path, {
    method, headers, signal, credentials: 'same-origin', body: form ? body : JSON.stringify(body)
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok || data === null) {
    throw Object.assign(new Error(data?.error || 'The server is unavailable. Please try again.'), { status: response.status });
  }
  return data;
}

export function useResource(path) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState({ path, loading: true });
  useEffect(() => {
    const controller = new AbortController();
    setState({ path, loading: true });
    api(path, { signal: controller.signal }).then(
      data => { if (!controller.signal.aborted) setState({ path, data }); },
      error => { if (!controller.signal.aborted) setState({ path, error: error.message }); }
    );
    return () => controller.abort();
  }, [path, version]);
  return { ...(state.path === path ? state : { loading: true }), retry: () => setVersion(v => v + 1),
    update: change => setState(current => ({ ...current, data: change(current.data) })) };
}
export const photoUrl = photo => '/uploads/' + encodeURIComponent(photo.fileName);
export const author = user => user ? user.firstName + ' ' + user.lastName : 'Unknown photographer';
export function dateLabel(date) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
}
