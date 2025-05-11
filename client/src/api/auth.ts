// src/api/auth.ts
const API = import.meta.env.VITE_API_URL;

export function loginWithGoogle() {
 return `${API}/auth/google`;
}

export async function logout() {
  try {
    const res = await fetch(`${API}/auth/logout`, {
      method: 'GET',
      credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      console.error('Logout failed', res.statusText);
    }
  } catch (err) {
    console.error('Logout error', err);
  }
}
