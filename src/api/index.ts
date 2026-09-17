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
    const message = error.response.data?.message || "Too many requests. Please try again later.";
    toast.error(message);
  }
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
  (error) => {
    handleRateLimit(error);
    return Promise.reject(error);
  }
);

export { API, authAPI };