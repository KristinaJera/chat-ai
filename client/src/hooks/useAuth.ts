// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { getProfile, User} from '../api/users';

// export type AuthUser = Omit<User, 'email'>;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   getProfile()
      .then(profile => {
        setUser(profile);   
      })
      .catch(err => {
        console.error('Auth error:', err);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { user, loading };
}
