import express from "express";
import cors from "cors";  
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" })); // Vite's default port

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("👤  connected:", socket.id);

  socket.on("disconnect", () => console.log("🚪 disconnected:", socket.id));
});

httpServer.listen(3001, () => console.log("API → http://localhost:3001"));
