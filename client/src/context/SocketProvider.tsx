// src/context/SocketProvider.tsx
import { ReactNode, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { SocketContext } from "./SocketContext";

// Grab your backend URL from Vite env
const SOCKET_URL = import.meta.env.VITE_API_URL!;

interface Props {
  children: ReactNode;
}

export function SocketProvider({ children }: Props) {
  // Initialize the socket once, synchronously:
  const [socket] = useState<Socket>(
    () => io(SOCKET_URL, { autoConnect: true, withCredentials: true })
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      void socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}
