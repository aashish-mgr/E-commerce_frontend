import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
export const IMAGE_BASE = import.meta.env.VITE_IMAGE_BASE_URL ?? 'http://localhost:3000/uploads';

export const getImageUrl = (image?: string) => {
  if (!image) return '';
  return image.startsWith('http') ? image : `${IMAGE_BASE}/${image}`;
};

const API = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})

const authAPI = axios.create({
  baseURL: API_BASE,
  headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
  withCredentials: true,
});

export {  API, authAPI };