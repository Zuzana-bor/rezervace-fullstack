/// <reference types="vite/client" />
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Automaticky přidej token do všech požadavků
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Debug logging pro produkci
    console.log('API Request:', {
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      method: config.method,
      hasToken: !!token,
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Automaticky zpracuj 401 chyby (neplatný token)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Debug logging pro všechny chyby
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 401) {
      // Token je neplatný - vymaž ho a přesměruj na login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
