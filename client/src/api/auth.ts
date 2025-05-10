// src/api/auth.ts
const API = import.meta.env.VITE_API_URL;

export function loginWithGoogle() {
  window.location.href = `${API}/auth/google`;
}

export async function logout() {
  await fetch(`${API}/auth/logout`, {
    credentials: "include",
  });
  // reload so that useAuth() sees user=null
  window.location.reload();
}
