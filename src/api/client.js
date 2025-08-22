// Lightweight HTTP client using fetch with JSON and Bearer token support

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/ChoirSite';

function buildHeaders(options = {}) {
  const headers = new Headers(options.headers || {});
  // Only set JSON headers if there is a body and it's not FormData
  if (options.body !== undefined && !(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');

  // Load token from localStorage if present
  const tokenKey = import.meta.env.AUTH_TOKEN_KEY || 'choirAuthToken';
  const token = options.token || localStorage.getItem(tokenKey);
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

export async function httpRequest(path, { method = 'GET', body, headers, token, query } = {}) {
  const url = new URL(path.startsWith('http') ? path : `${API_BASE_URL}${path}`);

  if (query && typeof query === 'object') {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      url.searchParams.set(key, String(value));
    });
  }

  const init = { method, headers: buildHeaders({ headers, body, token }) };
  if (body !== undefined) {
    init.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const response = await fetch(url, init);
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json().catch(() => ({})) : await response.text();

  if (!response.ok) {
    const error = new Error((data && data.message) || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const http = {
  get: (path, options) => httpRequest(path, { ...options, method: 'GET' }),
  post: (path, body, options) => httpRequest(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => httpRequest(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => httpRequest(path, { ...options, method: 'DELETE' })
};


