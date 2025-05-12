import { Router, RequestHandler, Response } from 'express';
import { IUser } from '../models/User';

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

export default router;
