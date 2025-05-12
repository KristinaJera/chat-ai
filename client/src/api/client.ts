import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.DEV ? '' : import.meta.env.VITE_API_URL,
  withCredentials: true,
});

client.interceptors.response.use(
  r => r,
  err => {
    if (
      axios.isAxiosError(err) &&
      err.response?.status === 401 &&
      !err.config?.url?.endsWith('/api/users/me') &&
      !err.config?.url?.endsWith('/auth/logout')
    ) {
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default client;
