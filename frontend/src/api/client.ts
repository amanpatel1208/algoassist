import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/authSlice';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
});

apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default apiClient;
