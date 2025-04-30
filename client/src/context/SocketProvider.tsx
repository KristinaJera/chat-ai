// src/context/SocketProvider.tsx
import { ReactNode, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { SocketContext } from "./SocketContext";

const SOCKET_URL = "http://localhost:3001";

export function SocketProvider({ children }: { children: ReactNode }) {
  // initialize the socket once, *synchronously*:
   const [socket] = useState<Socket>(() => io(SOCKET_URL, { autoConnect: true }));

 // cleanup on unmount
  useEffect(() => {
    return () => {
      void socket.disconnect();
   };
  }, [socket]);
  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}