// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { getProfile, User} from '../api/users';

export type AuthUser = Omit<User, 'email'>;

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(profile => {
        // we only need id, name, shareId here
        const { id, name, shareId } = profile;
        setUser({ id, name, shareId });
      })
      .catch(err => {
        // if 401 or other error, treat as not-logged-in
        console.error('Auth error:', err);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { user, loading };
}
