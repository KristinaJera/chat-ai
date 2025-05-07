// src/hooks/useMessages.ts

import { useEffect, useState, useCallback } from "react";
import type { Message } from "../types/message";
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

  // Join chat, load messages, and clean up
  useEffect(() => {
    setMessages([]);
    socket.emit("joinChat", chatId);

    getMessages(chatId)
      .then((msgs) => setMessages(msgs))
      .catch(console.error);

    return () => {
      socket.emit("leaveChat", chatId);
    };
  }, [chatId, socket]);

  // Handle real-time updates
  useEffect(() => {
    const onNew = (msg: Message) => {
      if (msg.roomId === chatId) setMessages((prev) => [...prev, msg]);
    };
    const onUpdate = (upd: Message) => {
      if (upd.roomId === chatId) {
        setMessages((prev) =>
          prev.map((m) => (m._id === upd._id ? upd : m))
        );
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

  // Actions for sending, editing, and deleting
  const send = useCallback(
    (body: string, replyTo?: string) =>
      createMessage({ chatId, authorId, body, replyTo }),
    [chatId, authorId]
  );
  const edit = useCallback((id: string, body: string) => editMessage(id, body), []);
  const remove = useCallback(
    async (id: string) => {
      await deleteMessage(id);
      // immediately remove from UI
      setMessages((prev) => prev.filter((m) => m._id !== id));
    },
    []
  );
  return { messages, send, edit, remove };
}
