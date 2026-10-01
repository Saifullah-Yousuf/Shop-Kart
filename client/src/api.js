import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((cfg) => {
  const u = JSON.parse(localStorage.getItem('user') || 'null');
  if (u?.token) cfg.headers.Authorization = `Bearer ${u.token}`;
  return cfg;
});

// If the token expired, log the user out everywhere
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem('user')) window.dispatchEvent(new Event('auth:expired'));
    return Promise.reject(err);
  }
);

export const errMsg = (e) =>
  e.response?.data?.message || (e.code === 'ERR_NETWORK' ? 'Cannot reach the server. Is the backend running?' : e.message);

export default api;
