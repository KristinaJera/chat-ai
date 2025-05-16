// src/hooks/useMessages.ts
import { useEffect, useState, useCallback } from "react";
import type { Message } from "../types/message";
import client from "../api/client";
import {
  getMessages,
  createMessage,
  editMessage,
  deleteMessage,
} from "../api/messages";
import { useSocket } from "./useSocket";

export function useMessages(chatId: string, authorId: string) {
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);

  // 1) Initial load + join
  useEffect(() => {
    setMessages([]);
    socket.emit("joinChat", chatId);
    getMessages(chatId).then(setMessages).catch(console.error);
    return () => {
      socket.emit("leaveChat", chatId);
    };
  }, [chatId, socket]);

  // 2) Real-time updates
  useEffect(() => {
    const onNew = (msg: Message) => {
      if (msg.roomId === chatId) setMessages((prev) => [...prev, msg]);
    };
    const onUpdate = (upd: Message) => {
      if (upd.roomId === chatId) {
        setMessages((prev) => prev.map((m) => (m._id === upd._id ? upd : m)));
      }
    };
    const onDelete = (del: Message) => {
      if (del.roomId === chatId) {
        setMessages((prev) => prev.filter((m) => m._id !== del._id));
      }
    };

    socket.on("message:new", onNew);
    socket.on("message:update", onUpdate);
    socket.on("message:delete", onDelete);

    return () => {
      socket.off("message:new", onNew);
      socket.off("message:update", onUpdate);
      socket.off("message:delete", onDelete);
    };
  }, [socket, chatId]);

  // 3) Polling fallback
  useEffect(() => {
    let active = true;
    const tick = async () => {
      try {
        const msgs = await getMessages(chatId);
        if (active) setMessages(msgs);
      } catch (e) {
        console.error("Polling error:", e);
      }
    };
    const id = setInterval(tick, 5000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [chatId]);

  // 4) send supports optional files
  const send = useCallback(
    async (
      body: string,
      replyTo?: string,
      attachments?: File[]
    ): Promise<Message> => {
      if (attachments && attachments.length > 0) {
        // === multipart upload via axios client ===
        const form = new FormData();
        form.append("chatId", chatId);
        form.append("body", body);
        if (replyTo) form.append("replyTo", replyTo);
        attachments.forEach((f) => form.append("attachments", f));

        const response = await client.post<Message>("/api/messages", form);
        return response.data;
      } else {
        // === JSON-only fallback ===
        return await createMessage({ chatId, authorId, body, replyTo });
      }
    },
    [chatId, authorId]
  );

  const edit = useCallback((id: string, body: string) => editMessage(id, body), []);
  const remove = useCallback(async (id: string) => {
    await deleteMessage(id);
    setMessages((prev) => prev.filter((m) => m._id !== id));
  }, []);

  return { messages, send, edit, remove };
}
