import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hotelpro_token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error?.message || error.message || 'Something went wrong. Please try again.';
    return Promise.reject(Object.assign(new Error(message), {
      status: error.response?.status,
      code: error.response?.data?.error?.code
    }));
  }
);

export default api;
