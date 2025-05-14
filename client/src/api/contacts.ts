import client from './client';

export interface Contact {
  name: string;
  shareId: string;
}

export async function getContacts(): Promise<Contact[]> {
  const { data } = await client.get<Contact[]>('/api/contacts');
  return data;
}
export async function deleteContact(shareId: string): Promise<void> {
  await client.delete(`/api/contacts/${shareId}`);
}
export async function createContact(contact: Contact): Promise<Contact> {
  const { data } = await client.post<Contact>('/api/contacts', contact);
  return data;
}
