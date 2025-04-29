// src/context/SocketProvider.tsx
import { ReactNode, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { SocketContext } from "./SocketContext";

const SOCKET_URL = "http://localhost:3001";

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io(SOCKET_URL);
    setSocket(s);
    return () => void s.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}
