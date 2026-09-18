import axios from 'axios';
import { toast } from '../lib/toast';

export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
export const IMAGE_BASE = import.meta.env.VITE_IMAGE_BASE_URL ?? 'http://localhost:3000/uploads';

export const getImageUrl = (image?: string) => {
  if (!image) return '';
  return image.startsWith('http') ? image : `${IMAGE_BASE}/${image}`;
};

const API = axios.create({
    baseURL: API_BASE,
    headers: {
        'Accept': 'application/json',
    },
})

const authAPI = axios.create({
  baseURL: API_BASE,
  headers: {
        'Accept': 'application/json',
    },
  withCredentials: true,
});

const handleRateLimit = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 429) {
    const message = error.response?.data?.message || "Too many requests. Please try again later.";
    toast.error(message);
  }
};

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retried?: boolean;
  }
}

const isAuthEndpoint = (url?: string) =>
  !!url &&
  (url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh'));

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null) => {
  unauthorizedHandler = handler;
};

let refreshInFlight: Promise<boolean> | null = null;

const refreshTokens = (): Promise<boolean> => {
  if (!refreshInFlight) {
    refreshInFlight = authAPI
      .post('/auth/refresh')
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
};

API.interceptors.response.use(
  (response) => response,
  (error) => {
    handleRateLimit(error);
    return Promise.reject(error);
  }
);

authAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    handleRateLimit(error);

    const status = error?.response?.status;
    const original = error?.config;

    if (
      status === 401 &&
      original &&
      !original._retried &&
      !isAuthEndpoint(original.url)
    ) {
      original._retried = true;
      const ok = await refreshTokens();
      if (ok) {
        return authAPI(original);
      }
      unauthorizedHandler?.();
    }

    return Promise.reject(error);
  }
);

export { API, authAPI };