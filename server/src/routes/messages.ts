// src/routes/messageRoutes.ts
import { Router, Request, Response, NextFunction } from "express";
import { Server as SocketIOServer } from "socket.io";
import { Types } from "mongoose";
import multer from "multer";
import path from "path";
import Message from "../models/Message";
import Chat from "../models/Chat";

function ensureAuth(req: any, res: any, next: NextFunction): void {
  console.log("🔐 ensureAuth: isAuthenticated?", req.isAuthenticated?.());
  if (req.isAuthenticated?.()) return next();
  console.log("🔐 ensureAuth: rejecting with 401");
  res.sendStatus(401);
}

// Multer setup
const uploadsDir = path.join(__dirname, "../uploads");
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename:    (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).substr(2,8)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});
const multipartMiddleware = upload.fields([
  { name: "attachments", maxCount: 10 },
]);

export default function messageRoutes(io: SocketIOServer): Router {
  const r = Router();

  // GET /api/messages?chatId=xxx
  r.get(
    "/",
    ensureAuth,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const userId = (req.user as any)._id;
        const chatId = typeof req.query.chatId === "string" ? req.query.chatId : "";

        if (!chatId || !Types.ObjectId.isValid(chatId)) {
          res.status(400).json({ error: "Invalid or missing chatId" });
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

        const msgs = await Message.find({ roomId: chatId }).sort({ createdAt: 1 });
        res.json(msgs);
      } catch (err) {
        console.error("Fetch messages error:", err);
        next(err);
      }
    }
  );

  // POST /api/messages  ← handles JSON & attachments
  r.post(
  "/",
  ensureAuth,

  // multipart detector
  (req, res, next) => {
    const ct = req.headers["content-type"] || "";
    if (ct.startsWith("multipart/form-data")) {
      return multipartMiddleware(req, res, next);
    }
    next();
  },

  // create message
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files =
        (req.files as Record<string, Express.Multer.File[]> | undefined)
          ?.attachments || [];

      const { chatId, body, replyTo } = req.body as {
        chatId: string;
        body?: string;
        replyTo?: string;
      };

      // validate chatId
      if (!chatId || !Types.ObjectId.isValid(chatId)) {
        res.status(400).json({ error: "Invalid or missing chatId" });
        return;
      }

      // require text or attachment
      if ((!body || !body.trim()) && files.length === 0) {
        res
          .status(400)
          .json({ error: "Message body or attachment required" });
        return;
      }

      // membership check
      const userId = (req.user as any)._id;
      const chat = await Chat.findById(chatId);
      if (!chat?.participants.some((p) => p.equals(userId))) {
        res.sendStatus(403);
        return;
      }

      // build payload
      const msgData: any = {
        roomId:   new Types.ObjectId(chatId),
        authorId: userId,
        body:     (body || "").trim(),
      };
      if (replyTo && Types.ObjectId.isValid(replyTo)) {
        msgData.replyTo = new Types.ObjectId(replyTo);
      }
      if (files.length) {
        msgData.attachments = files.map((f) => ({
          filename: f.originalname,
          mimeType: f.mimetype,
          url:      `/uploads/${f.filename}`,
          size:     f.size,
        }));
      }

      // persist & broadcast
      const msg = await Message.create(msgData);
      io.to(chatId).emit("message:new", msg);

      res.status(201).json(msg);
      return;
    } catch (err) {
      console.error("Create message error:", err);
      next(err);
    }
  }
);

  // PUT /api/messages/:id
  r.put(
    "/:id",
    ensureAuth,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const userId = (req.user as any)._id;
        const { id } = req.params;
        const { body } = req.body;

        if (!body || !body.trim()) {
          res.status(400).json({ error: "Message body is required" });
          return;
        }

        const msg = await Message.findById(id);
        if (!msg) {
          res.sendStatus(404);
          return;
        }
        if (!msg.authorId.equals(userId)) {
          res.sendStatus(403);
          return;
        }

        msg.body = body.trim();
        msg.status = "edited";
        msg.updatedAt = new Date();
        await msg.save();

        io.to(msg.roomId.toString()).emit("message:update", msg);
        res.json(msg);
      } catch (err) {
        console.error("Update message error:", err);
        next(err);
      }
    }
  );

  // DELETE /api/messages/:id
  r.delete(
    "/:id",
    ensureAuth,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const userId = (req.user as any)._id;
        const { id } = req.params;

        if (!Types.ObjectId.isValid(id)) {
          res.status(400).json({ error: "Invalid message ID" });
          return;
        }

        const msg = await Message.findById(id);
        if (!msg) {
          res.sendStatus(404);
          return;
        }
        if (!msg.authorId.equals(userId)) {
          res.sendStatus(403);
          return;
        }

        msg.status = "deleted";
        await msg.save();

        io.to(msg.roomId.toString()).emit("message:delete", msg);
        res.json(msg);
      } catch (err: any) {
        console.error("Delete message error:", err);
        next(err);
      }
    }
  );

  return r;
}
