/// src/routes/messageRoutes.ts
import { Router, Request, Response, NextFunction } from "express";
import { Server as SocketIOServer } from "socket.io";
import { Types } from "mongoose";
import multer from "multer";
// multer-s3 doesn’t ship its own types, so require and ignore
// @ts-ignore
const multerS3 = require("multer-s3");
import AWS from "aws-sdk";
import Message from "../models/Message";
import Chat from "../models/Chat";

// Extend the built-in Multer File with S3's `location`
type S3UploadedFile = Express.Multer.File & { location: string };

export default function messageRoutes(io: SocketIOServer): Router {
  const r = Router();

  // Authentication guard
  function ensureAuth(req: any, res: any, next: NextFunction): void {
    if (req.isAuthenticated?.()) return next();
    res.sendStatus(401);
  }

  // S3 + multer-s3 setup
  const s3 = new AWS.S3({ region: process.env.AWS_REGION });
  const uploadToS3 = multer({
    storage: multerS3({
      s3,
      bucket: process.env.S3_BUCKET_NAME!,
      // contentType: multerS3.AUTO_CONTENT_TYPE,
      // acl: "public-read",
      key: (_req: any, file: any, cb: any) => {
        const key = `uploads/${Date.now()}-${file.originalname}`;
        cb(null, key);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  }).fields([{ name: "attachments", maxCount: 10 }]);

  // GET /api/messages?chatId=xxx
  r.get(
    "/",
    ensureAuth,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const userId = (req.user as any)._id;
        const chatId = String(req.query.chatId || "");
        if (!Types.ObjectId.isValid(chatId)) {
          res.status(400).json({ error: "Invalid chatId" });
          return;
        }
        const chat = await Chat.findById(chatId);
        if (!chat?.participants.some((p) => p.equals(userId))) {
          res.sendStatus(403);
          return;
        }
        const msgs = await Message.find({ roomId: chatId }).sort({ createdAt: 1 });
        res.json(msgs);
      } catch (err) {
        next(err);
      }
    }
  );

  // POST /api/messages
  r.post(
    "/",
    ensureAuth,
    // Only run multer-s3 if multipart
    (req, res, next) => {
      const ct = req.headers["content-type"] || "";
      if (!ct.startsWith("multipart/form-data")) return next();
      uploadToS3(req, res, (err: any) => {
        if (err) {
          console.error("multer-s3 upload error:", err);
          return res.status(500).json({ error: "UploadFailed", details: err.message });
        }
        console.log("files:", req.files);
        next();
      });
    },
    // Handler
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const files = ((req.files as Record<string, S3UploadedFile[]>)?.attachments || []) as S3UploadedFile[];
        const { chatId, body, replyTo } = req.body as { chatId: string; body?: string; replyTo?: string };
        if (!Types.ObjectId.isValid(chatId)) {
          res.status(400).json({ error: "Invalid chatId" });
          return;
        }
        if ((!body || !body.trim()) && files.length === 0) {
          res.status(400).json({ error: "Message body or attachments required" });
          return;
        }
        const userId = (req.user as any)._id;
        const chat = await Chat.findById(chatId);
        if (!chat?.participants.some((p) => p.equals(userId))) {
          res.sendStatus(403);
          return;
        }
        const attachments = files.map((f) => ({
          filename: f.originalname,
          mimeType: f.mimetype,
          url: f.location,
          size: f.size,
        }));
        const msgData: any = {
          roomId: new Types.ObjectId(chatId),
          authorId: userId,
          body: (body || "").trim(),
          attachments: attachments.length ? attachments : undefined,
        };
        if (replyTo && Types.ObjectId.isValid(replyTo)) {
          msgData.replyTo = new Types.ObjectId(replyTo);
        }
        const msg = await Message.create(msgData);
        io.to(chatId).emit("message:new", msg);
        res.status(201).json(msg);
      } catch (err) {
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
      } catch (err) {
        next(err);
      }
    }
  );

  return r;
}