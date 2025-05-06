import { Router, Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import User, { IUser } from '../models/User';
import Chat, { IChat } from '../models/Chat';
import Message from '../models/Message';

const router = Router();

// auth guard: only calls res.sendStatus or next(), returns void
function ensureAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated && req.isAuthenticated()) {
    next();
  } else {
    res.sendStatus(401);
  }
}

// POST /api/chats - create or get 1:1 chat
router.post(
  '/',
  ensureAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const meId = (req.user as IUser)._id as Types.ObjectId;
      let participants: Types.ObjectId[] = [];

      if (Array.isArray(req.body.participants)) {
        participants = req.body.participants.map(
          (id: string) => new Types.ObjectId(id)
        );
      }

      if (req.body.inviteCode) {
        const other = await User.findOne({ shareId: req.body.inviteCode });
        if (!other) {
          res.status(404).json({ error: 'User not found' });
          return;
        }
        participants = [meId, other._id as Types.ObjectId];
      }

      // include self
      if (!participants.some(id => id.equals(meId))) {
        participants.push(meId);
      }

      // find exact match
      let chat = await Chat.findOne({
        participants: { $all: participants, $size: participants.length }
      });

      if (!chat) {
        chat = await Chat.create({ participants });
      }

      res.status(201).json(chat);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// POST /api/chats/:chatId/participants - add user
router.post(
  '/:chatId/participants',
  ensureAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const meId = (req.user as IUser)._id as Types.ObjectId;
      const { chatId } = req.params;
      const { inviteCode } = req.body;

      const chat = await Chat.findById(chatId);
      if (!chat) {
        res.sendStatus(404);
        return;
      }

      if (!chat.participants.some(id => id.equals(meId))) {
        res.sendStatus(403);
        return;
      }

      const other = await User.findOne({ shareId: inviteCode });
      if (!other) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const otherId = other._id as Types.ObjectId;
      if (!chat.participants.some(id => id.equals(otherId))) {
        chat.participants.push(otherId);
        await chat.save();
      }

      res.json(chat);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// GET /api/chats/:chatId/messages - fetch history
router.get(
  '/:chatId/messages',
  ensureAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const meId = (req.user as IUser)._id as Types.ObjectId;
      const { chatId } = req.params;

      const chat = await Chat.findById(chatId);
      if (!chat) {
        res.sendStatus(404);
        return;
      }

      if (!chat.participants.some(id => id.equals(meId))) {
        res.sendStatus(403);
        return;
      }

      const messages = await Message.find({ chat: chat._id }).sort('timestamp');
      res.json(messages);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

export default router;