import client from './client';
const API = import.meta.env.VITE_API_URL;

export function loginWithGoogle() {
  window.location.href = `${API}/auth/google`;
}
export async function logout(): Promise<void> {
  await client.post('/auth/logout');
}