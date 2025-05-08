const API_BASE = 'http://localhost:3001/api/chats';

export interface ChatSummary {
  _id: string;
  participants: { name: string; shareId: string }[];
}

export interface Chat {
  _id: string;
  participants: string[];
}

export interface Message {
  _id: string;
  chat: string;
  sender: string;
  body: string;
  timestamp: string;
}

// Fetch list of chats for current user
export async function fetchChats(): Promise<ChatSummary[]> {
  const res = await fetch(API_BASE, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to load chats: ${res.status}`);
  return res.json();
}

// Create (or get) a chat by share-IDs array or single inviteCode
export async function createChat(participants: string[]): Promise<Chat> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participants }),
  });
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || `Create chat failed: ${res.status}`);
  }
  return res.json();
}

// Invite additional user by shareId
export async function addParticipant(chatId: string, inviteCode: string): Promise<ChatSummary> {
  const res = await fetch(`${API_BASE}/${chatId}/participants`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inviteCode }),
  });
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || `Add participant failed: ${res.status}`);
  }
  return res.json();
}

// Fetch all messages for given chat
export async function fetchMessages(chatId: string): Promise<Message[]> {
  const res = await fetch(`${API_BASE}/${chatId}/messages`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to load messages: ${res.status}`);
  return res.json();
}

// Delete a chat by ID
export async function deleteChat(chatId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${chatId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || `Delete chat failed: ${res.status}`);
  }
}
// Remove a participant from a group chat 
export async function removeParticipant(
  chatId: string,
  shareId: string
): Promise<ChatSummary> {
  const res = await fetch(`${API_BASE}/${chatId}/participants`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shareId }),
  });
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || `Remove participant failed: ${res.status}`);
  }
  return res.json();
}