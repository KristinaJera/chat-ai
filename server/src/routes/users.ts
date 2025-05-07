import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User';
import { Types } from 'mongoose';

const router = Router();

// auth guard
function ensureAuth(req: any, res: any, next: NextFunction): void {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  res.sendStatus(401);
}

// GET /api/users/me - get current profile
router.get('/me', ensureAuth, (req: Request, res: Response) => {
  const u = req.user as IUser;
  res.json({
    id: u._id,
    name: u.name,
    email: u.email,
    shareId: u.shareId
  });
});

// PUT /api/users/me - update name/email
router.put('/me', ensureAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const u = req.user as IUser;
    const { name, email } = req.body;
    if (name) u.name = name;
    if (email) u.email = email;
    await u.save();
    res.json({ id: u._id, name: u.name, email: u.email, shareId: u.shareId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/users/me/password - change password
router.put('/me/password', ensureAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const u = req.user as any;
    const { currentPassword, newPassword } = req.body;

    // user must have a password (local account)
    if (!u.password) {
      res.status(400).json({ error: 'No local password set' });
      return;
    }
    const match = await bcrypt.compare(currentPassword, u.password);
    if (!match) {
      res.status(403).json({ error: 'Incorrect current password' });
      return;
    }
    // validate newPassword length
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      res.status(400).json({ error: 'Password too short' });
      return;
    }
    u.password = await bcrypt.hash(newPassword, 10);
    await u.save();
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
