const API_BASE_STORAGE_KEY = 'zakat_tracker_api_base_url_v1';
const DEFAULT_LOCAL_API_BASE_URL = 'http://127.0.0.1:5000';
const DEFAULT_CLOUD_API_BASE_URL = 'https://zekatapp-production.up.railway.app';

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const sanitizeBaseUrl = (value) => {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return '';
  }
  return trimTrailingSlash(normalized);
};

const readStoredApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    return sanitizeBaseUrl(window.localStorage.getItem(API_BASE_STORAGE_KEY));
  } catch (error) {
    return '';
  }
};

const getQueryApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const params = new URLSearchParams(window.location.search || '');
    return sanitizeBaseUrl(params.get('apiBase'));
  } catch (error) {
    return '';
  }
};

export const getApiBaseUrl = () => {
  const envBase = sanitizeBaseUrl(process.env.REACT_APP_API_BASE_URL);
  if (envBase) {
    return envBase;
  }

  if (typeof window === 'undefined') {
    return '';
  }

  const runtimeOverrideBase = sanitizeBaseUrl(window.__ZAKAT_API_BASE_URL);
  if (runtimeOverrideBase) {
    return runtimeOverrideBase;
  }

  const queryBase = getQueryApiBaseUrl();
  if (queryBase) {
    return queryBase;
  }

  const storedBase = readStoredApiBaseUrl();
  if (storedBase) {
    return storedBase;
  }

  const protocol = window.location.protocol;
  const isCraDevServer =
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
    window.location.port === '3000';

  // In CRA development mode, keep relative URLs to use package.json proxy.
  if (isCraDevServer) {
    return '';
  }

  // In packaged desktop/mobile mode, default to the production cloud backend
  // so Electron/mobile builds can sync out of the box.
  // This can still be overridden via REACT_APP_API_BASE_URL,
  // window.__ZAKAT_API_BASE_URL, ?apiBase=, or localStorage key.
  if (protocol === 'file:' || protocol === 'capacitor:') {
    return sanitizeBaseUrl(DEFAULT_CLOUD_API_BASE_URL) || DEFAULT_LOCAL_API_BASE_URL;
  }

  // Default to same-origin; if no backend exists, callers can fall back to local mode.
  return '';
};

export const buildApiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = getApiBaseUrl();
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
};
