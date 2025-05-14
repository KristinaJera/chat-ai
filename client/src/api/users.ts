import client from './client';

export interface User {
  id: string;
  name: string;
  email: string;
  shareId: string;
}

export async function getProfile(): Promise<User> {
  const { data } = await client.get<User>('/api/users/me');
  return data;
}

export async function getUserByShare(shareId: string): Promise<User> {
  const { data } = await client.get<User>(`/api/users/by-share/${shareId}`);
  return data;
}