// src/hooks/useTyping.ts
import { useEffect, useState, useRef, useCallback } from "react";
import { useSocket } from "./useSocket";

export function useTyping(roomId: string, username: string) {
  const socket = useSocket();
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  // In browser, setTimeout returns a number ID
  const timeoutId = useRef<number | null>(null);

  // 1. Listen for incoming typing broadcasts
  useEffect(() => {
    const handleTyping = (payload: { username: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (payload.isTyping) next.add(payload.username);
        else next.delete(payload.username);
        return next;
      });
    };

    socket.on("typing", handleTyping);
    return () => {
      socket.off("typing", handleTyping);
    };
  }, [socket]);

  // 2. Functions to emit start & stop
  const startTyping = useCallback(() => {
    socket.emit("typing:start", { roomId, username });
  }, [socket, roomId, username]);

  const stopTyping = useCallback(() => {
    socket.emit("typing:stop", { roomId, username });
  }, [socket, roomId, username]);

  // 3. onInput to hook into your input’s onChange/onKeyDown
  const onInput = useCallback(() => {
    if (timeoutId.current !== null) {
      clearTimeout(timeoutId.current);
    }
    startTyping();
    // schedule the stop after 1s of inactivity
    timeoutId.current = window.setTimeout(stopTyping, 1000);
  }, [startTyping, stopTyping]);

  return { typingUsers, onInput };
}
