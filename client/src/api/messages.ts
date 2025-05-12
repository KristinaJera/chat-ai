import client from './client';
import type { Message } from '../types/message';

export const getMessages = async (
  chatId: string
): Promise<Message[]> => {
  const { data } = await client.get<Message[]>(
    `/api/chats/${chatId}/messages`
  );
  return data;
};
export const createMessage = async (
  msg: Partial<Message> & { chatId: string }
): Promise<Message> => {
  const { data } = await client.post<Message>(
    '/api/messages',
    {
      chatId: msg.chatId,
      body: msg.body,
      replyTo: msg.replyTo,
    }
  );
  return data;
};

export const editMessage = async (
  id: string,
  body: string
): Promise<Message> => {
  const { data } = await client.put<Message>(
    `/api/messages/${encodeURIComponent(id)}`,
    { body }
  );
  return data;
};

export const deleteMessage = async (
  id: string
): Promise<Message> => {
  const { data } = await client.delete<Message>(
    `/api/messages/${encodeURIComponent(id)}`
  );
  return data;
};