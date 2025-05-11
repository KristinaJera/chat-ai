
const API_BASE = `${import.meta.env.VITE_API_URL}/api/users`;

export interface User {
  id: string;
  name: string;
  email: string;
  shareId: string;
}

/**
 * Fetch the current user's profile.
 * @returns Promise resolving to ProfileData
 */
export async function getProfile(): Promise<User> {
  const res = await fetch(`${API_BASE}/me`, {
    credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch profile: ${res.status}`);
  }
  return res.json();
}
