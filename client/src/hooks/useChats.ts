import { useState, useEffect } from 'react';

export interface ChatSummary {
  _id: string;
  participants: { name: string; shareId: string }[];
}

export function useChats() {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/chats', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load chats');
        return res.json() as Promise<ChatSummary[]>;
      })
      .then(setChats)
      .catch(err => console.error('useChats error:', err))
      .finally(() => setLoading(false));
  }, []);

  return { chats, loading };
}
