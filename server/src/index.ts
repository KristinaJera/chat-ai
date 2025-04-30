import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./db";
import messagesRoutes from "./routes/messages";
import aiRoutes from "./routes/ai";
import Message from "./models/Message";


const MONGO_URI = "mongodb://127.0.0.1:27017/chat-ai"; // change to Atlas if needed
const CLIENT_ORIGIN = "http://localhost:5173";
const PORT = 3001;

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

const http = createServer(app);
const io = new Server(http, { cors: { origin: CLIENT_ORIGIN } });

/* ---------- WebSocket events ---------- */
io.on("connection", (socket) => {
  console.log("👤", socket.id, "connected");

  socket.on("message:new", async (payload) => {
    const saved = await Message.create(payload);
    io.to(payload.roomId).emit("message:new", saved);
  });
    // 👇 allow clients to join arbitrary rooms
    socket.on("join", (roomId: string) => {
      console.log(`socket ${socket.id} joining room ${roomId}`);
      socket.join(roomId);
    });
  

  // typing indicator
  socket.on("typing:start", (p) =>
    socket.to(p.roomId).emit("typing", { ...p, isTyping: true })
  );
  socket.on("typing:stop", (p) =>
    socket.to(p.roomId).emit("typing", { ...p, isTyping: false })
  );
});

/* ---------- REST routes ---------- */
app.use("/api/messages", messagesRoutes(io)); // pass io for emits
app.use("/api/ai", aiRoutes);

connectDB(MONGO_URI).then(() =>
  http.listen(PORT, () => console.log(`API 👉 http://localhost:${PORT}`))
);

/* export for tests */
export { app, io };
