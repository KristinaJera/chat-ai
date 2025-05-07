import type { Message } from '../types/message';

const BASE = 'http://localhost:3001/api/messages';

// Fetch all messages for a given chat
export const getMessages = async (chatId: string): Promise<Message[]> => {
    const res = await fetch(`${BASE}?chatId=${encodeURIComponent(chatId)}`, {
       credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(`Failed to load messages: ${res.status} - ${error?.error || 'Unknown error'}`);
  }

  return res.json();
};

// Create a new message
export const createMessage = async (msg: Partial<Message> & { chatId: string }): Promise<Message> => {
  const res = await fetch(BASE, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chatId: msg.chatId,
      body:   msg.body,
      replyTo: msg.replyTo,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(`Failed to create message: ${res.status} - ${error?.error || 'Unknown error'}`);
  }

  return res.json();
};

// Edit an existing message
export const editMessage = async (id: string, body: string): Promise<Message> => {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(`Failed to edit message: ${res.status} - ${error?.error || 'Unknown error'}`);
  }

  return res.json();
};

// Delete a message
export const deleteMessage = async (id: string): Promise<Message> => {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(`Failed to delete message: ${res.status} - ${error?.error || 'Unknown error'}`);
  }

  return res.json();
};
