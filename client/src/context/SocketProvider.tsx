// import { ReactNode, useEffect, useState } from "react";
// import { io, type Socket } from "socket.io-client";
// import { SocketContext } from "./SocketContext";

// const SOCKET_URL = import.meta.env.VITE_API_URL!;

// interface Props {
//   children: ReactNode;
// }

// export function SocketProvider({ children }: Props) {
//   const [socket] = useState<Socket>(() =>
//     io(SOCKET_URL, { 
//       path: '/socket.io',
//       transports: ['websocket'],
//       withCredentials: true,
//       autoConnect: false,
//     })
//   );

//   useEffect(() => {
//     return () => {
//       void socket.disconnect();
//     };
//   }, [socket]);

//   return (
//     <SocketContext.Provider value={socket}>
//       {children}
//     </SocketContext.Provider>
//   );
// }

import { ReactNode, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SocketContext } from "./SocketContext";

const SOCKET_URL = import.meta.env.VITE_API_URL!;

interface Props {
  children: ReactNode;
}

export function SocketProvider({ children }: Props) {
  const [socket] = useState<Socket>(() =>
    io(SOCKET_URL, { 
      path: '/socket.io',
      transports: ['websocket'],
      withCredentials: true,
      autoConnect: false,
    })
  );

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
