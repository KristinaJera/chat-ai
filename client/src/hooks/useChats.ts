import { useState, useEffect } from 'react';
import { fetchChats } from '../api/chats';

export interface ChatSummary {
  _id: string;
  participants: { name: string; shareId: string }[];
}

export function useChats() {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats()
      .then(data => setChats(data))
      .catch(err => console.error('useChats error:', err))
      .finally(() => setLoading(false));
  }, []);

  return { chats, loading, setChats };
}
