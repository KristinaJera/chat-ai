// src/api/messages.ts
import type { Message } from "../types/message";

const BASE = "http://localhost:3001/api/messages";

export const getMessages = (roomId: string): Promise<Message[]> =>
  fetch(`${BASE}?roomId=${roomId}`)
    .then((r) => r.json() as Promise<Message[]>);

export const createMessage = (msg: Partial<Message>): Promise<Message> =>
  fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(msg),
  }).then((r) => r.json() as Promise<Message>);

export const editMessage = (
  id: string,
  body: string
): Promise<Message> =>
  fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  }).then((r) => r.json() as Promise<Message>);

export const deleteMessage = (id: string): Promise<Message> =>
  fetch(`${BASE}/${id}`, {
    method: "DELETE",
  }).then((r) => r.json() as Promise<Message>);
