import { Router, RequestHandler, Response } from 'express';
import { IUser } from '../models/User';
import UserModel from '../models/User';
import { Types } from 'mongoose';


const router = Router();

// Auth guard middleware using Express's type
const ensureAuth: RequestHandler = (req, res, next) => {
  // Passport adds isAuthenticated and user
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.sendStatus(401);
};

// GET /api/users/me — return current authenticated user
router.get(
  '/me',
  ensureAuth,
  (req, res: Response) => {
    // Cast req.user (provided by Passport) to IUser
    const u = req.user as IUser;
    res.json({
      id: (u._id as unknown as import('mongoose').Types.ObjectId).toString(),
      name: u.name,
      email: u.email,
      shareId: u.shareId,
    });
  }
);

router.delete(
  '/contacts/:shareId',
  ensureAuth,
  async (req, res) => {
    const { shareId } = req.params;
    const currentUser = req.user as any;

    // Validate the current user ID
    if (!Types.ObjectId.isValid(currentUser._id)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }
    const userId = currentUser._id.toString();

    try {
      const updated = await UserModel.findByIdAndUpdate(
        userId,
        { $pull: { contacts: shareId } },
        { new: true }
      ).exec();

      if (!updated) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.sendStatus(204);
    } catch (err) {
      console.error('Remove contact error:', err);
      res.status(500).json({ error: 'Failed to remove contact' });
    }
  }
);

router.get(
  '/by-share/:shareId',
  ensureAuth,
  async (req: any, res: Response): Promise<void> => {
    const shareId: string = req.params.shareId;
    try {
      const user = await UserModel.findOne({ shareId }).select('name email shareId');
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json({
        id:       (user._id as Types.ObjectId).toString(),
        name:     user.name,
        email:    user.email,
        shareId:  user.shareId,
      });
    } catch (err) {
      console.error('Error fetching user by shareId:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);
export default router;
