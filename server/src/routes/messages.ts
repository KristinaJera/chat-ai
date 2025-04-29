import { Router } from "express";
import { Server as SocketIOServer } from "socket.io";
import Message from "../models/Message";

export default function messageRoutes(io: SocketIOServer): Router {
  const r = Router();

  /* ─── POST /api/messages ─── */
  r.post("/", async (req, res) => {
    const msg = await Message.create(req.body);
    io.to(msg.roomId).emit("message:new", msg);
    res.status(201).json(msg);            // no `return`
  });

  /* ─── PUT /api/messages/:id  (edit) ─── */
  r.put("/:id", async (req, res) => {
    const { id }   = req.params;
    const { body } = req.body;

    if (!body?.trim()) {
      res.sendStatus(400);                // just call, don’t return
      return;
    }

    const up = await Message.findByIdAndUpdate(
      id,
      { body, status: "edited", updatedAt: Date.now() },
      { new: true }
    );
    if (!up) {
      res.sendStatus(404);
      return;
    }

    io.to(up.roomId).emit("message:update", up);
    res.json(up);
  });

  /* ─── DELETE /api/messages/:id  (soft-delete) ─── */
  r.delete("/:id", async (req, res) => {
    const { id } = req.params;

    const del = await Message.findByIdAndUpdate(
      id,
      { body: "", status: "deleted", updatedAt: Date.now() },
      { new: true }
    );
    if (!del) {
      res.sendStatus(404);
      return;
    }

    io.to(del.roomId).emit("message:delete", del);
    res.json(del);
  });

  return r;
}
