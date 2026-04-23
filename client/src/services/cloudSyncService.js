import { buildApiUrl, getApiBaseUrl } from './runtimeConfig';

const SESSION_STORAGE_KEY = 'zakat_tracker_cloud_session_v1';
const REQUEST_TIMEOUT_MS = 8000;

const normalizeSession = (session) => {
  if (!session || typeof session !== 'object') {
    return null;
  }

  const token = String(session.token || '').trim();
  const username = String(session.username || '').trim();
  const userId = Number(session.userId);

  if (!token || !username || !Number.isFinite(userId)) {
    return null;
  }

  return {
    token,
    username,
    userId
  };
};

const readSession = () => {
  try {
    const rawValue = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue);
    return normalizeSession(parsed);
  } catch (error) {
    return null;
  }
};

const saveSession = (session) => {
  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

const createRequestError = (message, code = 'request_failed') => {
  const error = new Error(message);
  error.code = code;
  return error;
};

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const targetUrl = String(url || '');

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw createRequestError(`Request timed out (${targetUrl})`, 'timeout');
    }
    throw createRequestError(`Network request failed (${targetUrl})`, 'network');
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const parseResponsePayload = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (isJson) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : {};
};

const sendRequest = async (path, { method = 'GET', body, token } = {}) => {
  const headers = {};
  const requestUrl = buildApiUrl(path);

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetchWithTimeout(requestUrl, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch (error) {
    if (error?.code === 'network' || error?.code === 'timeout') {
      const backendBase = getApiBaseUrl() || 'same-origin';
      const endpoint = `${backendBase}${path.startsWith('/') ? path : `/${path}`}`;
      throw createRequestError(
        `${error.message}. Backend endpoint: ${endpoint}. Make sure the server is running and reachable.`,
        error.code
      );
    }
    throw error;
  }

  const payload = await parseResponsePayload(response);

  if (!response.ok) {
    const message =
      payload?.error ||
      payload?.message ||
      `Request failed with status ${response.status}`;

    if (response.status === 401) {
      throw createRequestError(message, 'unauthorized');
    }

    throw createRequestError(message, 'request_failed');
  }

  return payload;
};

const cloudSyncService = {
  getSession() {
    return readSession();
  },

  clearSession() {
    saveSession(null);
  },

  async register(username, password) {
    const payload = await sendRequest('/api/auth/register', {
      method: 'POST',
      body: { username, password }
    });

    return payload?.user || null;
  },

  async login(username, password) {
    const payload = await sendRequest('/api/auth/login', {
      method: 'POST',
      body: { username, password }
    });

    const normalized = normalizeSession({
      token: payload?.token,
      username: payload?.user?.username,
      userId: payload?.user?.id
    });

    if (!normalized) {
      throw createRequestError('Invalid login response', 'request_failed');
    }

    saveSession(normalized);
    return normalized;
  },

  async logout() {
    const session = readSession();
    if (!session?.token) {
      saveSession(null);
      return;
    }

    try {
      await sendRequest('/api/auth/logout', {
        method: 'POST',
        token: session.token
      });
    } finally {
      saveSession(null);
    }
  },

  async getState() {
    const session = readSession();
    if (!session?.token) {
      throw createRequestError('Not authenticated', 'unauthorized');
    }

    return sendRequest('/api/sync/state', {
      method: 'GET',
      token: session.token
    });
  },

  async saveState(state) {
    const session = readSession();
    if (!session?.token) {
      throw createRequestError('Not authenticated', 'unauthorized');
    }

    return sendRequest('/api/sync/state', {
      method: 'PUT',
      token: session.token,
      body: { state }
    });
  }
};

export default cloudSyncService;
