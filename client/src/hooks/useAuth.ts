import { useState, useEffect } from 'react';
import { User } from '../api/users';

// export interface User {
//   email:string;
//   id: string;
//   name: string;
//   shareId: string;
// }

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then(res => {
        if (res.status === 401) {
          // not logged in → return null without error
          return null;
        }
        if (!res.ok) {
          // any other non-200 is unexpected
          throw new Error(`Unexpected HTTP ${res.status}`);
        }
        return res.json() as Promise<User>;
      })
      .then(u => {
        if (u) setUser(u);
      })
      .catch(() => {
      
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // ← runs only once

  return { user, loading };
}