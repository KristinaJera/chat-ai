import { useEffect, useState, useCallback } from "react";
import type { Message } from "../types/message";
import {
  getMessages,
  createMessage,
  editMessage,
  deleteMessage,
} from "../api/messages";
import { useSocket } from "./useSocket";

export function useMessages(roomId: string, authorId: string) {
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);

  // join room & load history
  useEffect(() => {
    socket.emit("join", roomId);
    getMessages(roomId).then(setMessages);
  }, [roomId, socket]);

  // subscribe to WS events
  useEffect(() => {
    const onNew = (msg: Message) => setMessages((m) => [...m, msg]);
    const onUpdate = (upd: Message) =>
      setMessages((m) => m.map((x) => (x._id === upd._id ? upd : x)));
    const onDelete = (del: Message) =>
      setMessages((m) => m.map((x) => (x._id === del._id ? del : x)));

    socket.on("message:new", onNew);
    socket.on("message:update", onUpdate);
    socket.on("message:delete", onDelete);
    return () => {
      socket.off("message:new", onNew);
      socket.off("message:update", onUpdate);
      socket.off("message:delete", onDelete);
    };
  }, [socket]);

  // actions
  const send = useCallback(
    (body: string, replyTo?: string) => {
      createMessage({ roomId, authorId, body, replyTo });
    },
    [roomId, authorId]
  );
  const edit = useCallback((id: string, body: string) => {
    console.log("PUT /api/messages", id, body);
    editMessage(id, body);
  }, []);
  const remove = useCallback((id: string) => {
    console.log("DELETE /api/messages", id);
    deleteMessage(id);
  }, []);

  return { messages, send, edit, remove };
}
