// import type { Message } from '../types/message';

// const API_BASE = `${import.meta.env.VITE_API_URL}/api/messages`;

// // Fetch all messages for a given chat
// export const getMessages = async (chatId: string): Promise<Message[]> => {
//     const res = await fetch(`${API_BASE}?chatId=${encodeURIComponent(chatId)}`, {
//        credentials: 'include',
//            headers: { 'Content-Type': 'application/json' },
//   });

//   if (!res.ok) {
//     const error = await res.json().catch(() => ({}));
//     throw new Error(`Failed to load messages: ${res.status} - ${error?.error || 'Unknown error'}`);
//   }

//   return res.json();
// };

// // Create a new message
// export const createMessage = async (msg: Partial<Message> & { chatId: string }): Promise<Message> => {
//   const res = await fetch(API_BASE, {
//     method: 'POST',
//     credentials: 'include',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       chatId: msg.chatId,
//       body:   msg.body,
//       replyTo: msg.replyTo,
//     }),
//   });

//   if (!res.ok) {
//     const error = await res.json().catch(() => ({}));
//     throw new Error(`Failed to create message: ${res.status} - ${error?.error || 'Unknown error'}`);
//   }

//   return res.json();
// };

// // Edit an existing message
// export const editMessage = async (id: string, body: string): Promise<Message> => {
//   const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
//     method: 'PUT',
//     credentials: 'include',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ body }),
//   });

//   if (!res.ok) {
//     const error = await res.json().catch(() => ({}));
//     throw new Error(`Failed to edit message: ${res.status} - ${error?.error || 'Unknown error'}`);
//   }

//   return res.json();
// };

// // Delete a message
// export const deleteMessage = async (id: string): Promise<Message> => {
//   const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
//     method: 'DELETE',
//     credentials: 'include',
//         headers: { 'Content-Type': 'application/json' },
//   });

//   if (!res.ok) {
//     const error = await res.json().catch(() => ({}));
//     throw new Error(`Failed to delete message: ${res.status} - ${error?.error || 'Unknown error'}`);
//   }

//   return res.json();
// };

// src/api/messages.ts
import client from './client';
import type { Message } from '../types/message';

export function getMessages(chatId: string): Promise<Message[]> {
  return client
    .get<Message[]>('/api/messages', { params: { chatId } })
    .then(r => r.data);
}

export function createMessage(msg: Partial<Message> & { chatId: string }): Promise<Message> {
  return client
    .post<Message>('/api/messages', {
      chatId: msg.chatId,
      body: msg.body,
      replyTo: msg.replyTo,
    })
    .then(r => r.data);
}

export function editMessage(id: string, body: string): Promise<Message> {
  return client
    .put<Message>(`/api/messages/${encodeURIComponent(id)}`, { body })
    .then(r => r.data);
}

export function deleteMessage(id: string): Promise<Message> {
  return client
    .delete<Message>(`/api/messages/${encodeURIComponent(id)}`)
    .then(r => r.data);
}
