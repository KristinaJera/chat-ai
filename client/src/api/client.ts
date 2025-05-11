// src/api/client.ts
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

const client = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Optional: throw just the server-side message on error
client.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.error ?? error.message;
    return Promise.reject(new Error(message));
  }
);

export default client;
