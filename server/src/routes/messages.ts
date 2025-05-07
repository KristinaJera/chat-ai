import { Router, Request, Response, NextFunction } from "express";
import { Server as SocketIOServer } from "socket.io";
import { Types } from "mongoose";
import Message from "../models/Message";
import Chat from "../models/Chat";

function ensureAuth(req: any, res: any, next: NextFunction): void {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.sendStatus(401);
  return;
}

export default function messageRoutes(io: SocketIOServer): Router {
  const r = Router();

  // GET /api/messages?roomId=xxx
  r.get(
    "/",
    ensureAuth,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const userId = (req.user as any)._id;
        const chatId = typeof req.query.chatId === "string" ? req.query.chatId : undefined;

        if (!chatId || !Types.ObjectId.isValid(chatId)) {
        res.status(400).json({ error: "Invalid chatId" });
          return;
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
          res.status(404).json({ error: "Chat not found" });
          return;
        }
        if (!chat.participants.some((p: any) => p.equals(userId))) {
          res.sendStatus(403);
          return;
        }

        const msgs = await Message.find({ roomId: new Types.ObjectId(chatId) }).sort({ createdAt: 1 });
        res.json(msgs);
      } catch (err) {
        console.error("Fetch messages error:", err);
        res.status(500).json({ error: "Server error" });
      }
    }
  );

  // POST /api/messages
  r.post(
    "/",
    ensureAuth,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const userId = (req.user as any)._id;
        const { chatId, body, replyTo } = req.body as Partial<{
          chatId: string;
          body: string;
          replyTo?: string;
        }>;

        if (!chatId || !Types.ObjectId.isValid(chatId)) {
        res.status(400).json({ error: "Invalid chatId" });
          return;
        }

        if (!body || typeof body !== "string" || !body.trim()) {
          res.status(400).json({ error: "Message body is required" });
          return;
        }

        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.some((p: any) => p.equals(userId))) {
          res.sendStatus(403);
          return;
        }

        const msg = await Message.create({
          roomId: new Types.ObjectId(chatId),
          authorId: userId,
          body,
          replyTo: replyTo ? new Types.ObjectId(replyTo) : undefined,
        });

        io.to(chatId).emit("message:new", msg);
        res.status(201).json(msg);
      } catch (err) {
        console.error("Create message error:", err);
        res.status(500).json({ error: "Server error" });
      }
    }
  );

  // PUT /api/messages/:id
  r.put(
    "/:id",
    ensureAuth,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const userId = (req.user as any)._id;
        const { id } = req.params;
        const { body } = req.body;

        if (!body || typeof body !== "string" || !body.trim()) {
          res.status(400).json({ error: "Message body is required" });
          return;
        }

        const msg = await Message.findById(id);
        if (!msg) {
          res.sendStatus(404);
          return;
        }

        if (msg.authorId.toString() !== userId.toString()) {
          res.sendStatus(403);
          return;
        }

        msg.body = body;
        msg.status = "edited";
        msg.updatedAt = new Date();
        await msg.save();
        io.to(msg.roomId.toString()).emit("message:update", msg);
        res.json(msg);
      } catch (err) {
        console.error("Update message error:", err);
        res.status(500).json({ error: "Server error" });
      }
    }
  );

  // DELETE /api/messages/:id
  r.delete(
    "/:id",
    ensureAuth,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const userId = (req.user as any)._id;
        const { id } = req.params;
        const msg = await Message.findById(id);

        if (!msg) {
          res.sendStatus(404);
          return;
        }

        if (msg.authorId.toString() !== userId.toString()) {
          res.sendStatus(403);
          return;
        }

        msg.body = "";
        msg.status = "deleted";
        msg.updatedAt = new Date();
        await msg.save();
        io.to(msg.roomId.toString()).emit("message:delete", msg);
        res.json(msg);
      } catch (err) {
        console.error("Delete message error:", err);
        res.status(500).json({ error: "Server error" });
      }
    }
  );

  return r;
}
