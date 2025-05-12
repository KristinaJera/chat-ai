import { Router, Request, Response, NextFunction } from 'express';
import { Types, Document } from 'mongoose';
import User, { IUser } from '../models/User';
import Chat, { IChat } from '../models/Chat';
import Message from '../models/Message';

const router = Router();

// Auth guard middleware
function ensureAuth(
  req: Request & { isAuthenticated: () => boolean },
  res: Response,
  next: NextFunction
): void {
  if (req.isAuthenticated()) {
    return next();
  }
  res.sendStatus(401);
}

// GET /api/chats - list chats that include the current user
router.get(
  '/',
  ensureAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const meId = (req.user as IUser)._id as Types.ObjectId;
      const chats = await Chat.find({ participants: meId })
        .select('participants')
        .populate('participants', 'name shareId');
      res.json(chats);
    } catch (err) {
      console.error('List chats error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// POST /api/chats - create or fetch 1:1 or group chat by shareId(s)
router.post(
  '/',
  ensureAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const meId = (req.user as IUser)._id as Types.ObjectId;
      let participants: Types.ObjectId[] = [];

      // 1:1 chat via inviteCode (shareId)
      if (typeof req.body.inviteCode === 'string') {
        const other = await User.findOne({ shareId: req.body.inviteCode });
        if (!other) {
          res.status(404).json({ error: 'User not found for inviteCode' });
          return;
        }
        const otherId = other._id as Types.ObjectId;
        participants = [meId, otherId];
      }
      // Group chat via array of shareIds
      else if (Array.isArray(req.body.participants)) {
        const shareIds = req.body.participants as string[];
        const users = await User.find({ shareId: { $in: shareIds } });
        if (users.length !== shareIds.length) {
          res.status(404).json({ error: 'One or more users not found' });
          return;
        }
        participants = users.map(u => u._id as Types.ObjectId);
      }

      // Always include current user
      if (!participants.some(id => id.equals(meId))) {
        participants.push(meId);
      }

      // Find existing chat with exact participants
      let chat = await Chat.findOne({
        participants: { $all: participants, $size: participants.length }
      });

      if (!chat) {
        chat = await Chat.create({ participants });
      }

      res.status(201).json(chat);
    } catch (err) {
      console.error('Chat creation error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// POST /api/chats/:chatId/participants - add participant to existing chat
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
      console.error('Add participant error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// GET /api/chats/:chatId/messages - fetch only messages for this chat
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

      const messages = await Message.find({ roomId: chat._id }).sort('timestamp');
      res.json(messages);
    } catch (err) {
      console.error('Fetch messages error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// DELETE /api/chats/:chatId — delete a chat (and its messages)
router.delete(
  '/:chatId',
  ensureAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const meId = (req.user as IUser)._id as Types.ObjectId;
      const { chatId } = req.params;

      if (!Types.ObjectId.isValid(chatId)) {
        res.status(400).json({ error: 'Invalid chatId' });
        return;
      }
      const chat = await Chat.findById(chatId);
      if (!chat) {
        res.sendStatus(404);
        return;
      }

      if (!chat.participants.some(id => id.equals(meId))) {
        res.sendStatus(403);
        return;
      }

      await Message.deleteMany({ roomId: chat._id });
      await Chat.findByIdAndDelete(chat._id);

      res.sendStatus(204);
    } catch (err) {
      console.error('Delete chat error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// DELETE /api/chats/:chatId/participants - remove a participant by shareId
router.delete(
  '/:chatId/participants',
  ensureAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const meId = (req.user as IUser)._id as Types.ObjectId;
      const { chatId } = req.params;
      const { shareId } = req.body;

      const chat = await Chat.findById(chatId);
      if (!chat) {
        res.sendStatus(404);
        return;
      }

      if (!chat.participants.some(id => id.equals(meId))) {
        res.sendStatus(403);
        return;
      }

      const userToRemove = await User.findOne({ shareId });
      if (!userToRemove) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Cast _id to ObjectId for proper comparison
      const userIdToRemove = userToRemove._id as Types.ObjectId;
      chat.participants = chat.participants.filter(
        id => !id.equals(userIdToRemove)
      );
      await chat.save();

      await chat.populate('participants', 'name shareId');
      res.json(chat);
    } catch (err) {
      console.error('Remove participant error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

export default router;