// src/hooks/useSocket.ts
import { useContext } from "react";
import { SocketContext } from "../context/SocketContext";
import type { Socket } from "socket.io-client";

export function useSocket(): Socket {
  const socket = useContext(SocketContext);
  if (!socket) throw new Error("useSocket must be used within a SocketProvider");
  return socket;
}
