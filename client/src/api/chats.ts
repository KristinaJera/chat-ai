import client from './client';

export interface ChatSummary {
  _id: string;
  participants: { name: string; shareId: string }[];
}

export interface Chat {
  _id: string;
  participants: string[];
}

export async function fetchChats(): Promise<ChatSummary[]> {
  const { data } = await client.get<ChatSummary[]>('/api/chats');
  return data;
}

export async function createChat(
  participants: string[]
): Promise<Chat> {
  const { data } = await client.post<Chat>('/api/chats', {
    participants,
  });
  return data;
}

export async function addParticipant(
  chatId: string,
  inviteCode: string
): Promise<ChatSummary> {
  const { data } = await client.post<ChatSummary>(
    `/api/chats/${chatId}/participants`,
    { inviteCode }
  );
  return data;
}

export async function deleteChat(chatId: string): Promise<void> {
  await client.delete(`/api/chats/${chatId}`);
}

export async function removeParticipant(
  chatId: string,
  shareId: string
): Promise<ChatSummary> {
  const { data } = await client.delete<ChatSummary>(
    `/api/chats/${chatId}/participants`,
    { data: { shareId } }
  );
  return data;
}
