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

  // Initial load and join chat
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

  // Real-time updates via socket
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

  // Polling fallback in case socket fails
  useEffect(() => {
    let isActive = true;

    const fetchAndUpdate = async () => {
      try {
        const newMessages = await getMessages(chatId);
        if (isActive) setMessages(newMessages);
      } catch (err) {
        console.error("Polling fetch failed:", err);
      }
    };

    const interval = setInterval(fetchAndUpdate, 5000); // poll every 5 seconds
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [chatId]);

  const send = useCallback(
    (body: string, replyTo?: string) =>
      createMessage({ chatId, authorId, body, replyTo }),
    [chatId, authorId]
  );

  const edit = useCallback((id: string, body: string) => editMessage(id, body), []);

  const remove = useCallback(
    async (id: string) => {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m._id !== id));
    },
    []
  );

  return { messages, send, edit, remove };
}
