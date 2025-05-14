// src/routes/contacts.ts
import { Router, RequestHandler } from 'express';
import UserModel from '../models/User';
import { Types } from 'mongoose';

const router = Router();

// Auth guard
const ensureAuth: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.sendStatus(401);
};

// GET /api/contacts — list current user's contacts
router.get(
  '/',
  ensureAuth,
  async (req, res) => {
    const currentUser = (req.user as any);
    if (!Types.ObjectId.isValid(currentUser._id)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }
    const userId = currentUser._id.toString();

    const user = await UserModel.findById(userId).select('contacts').exec();
    if (!user) {
      res.sendStatus(404);
      return;
    }

    // Populate contact details
    const contacts = await UserModel.find(
      { shareId: { $in: user.contacts } },
      'name shareId'
    ).exec();

    res.json(contacts);
  }
);

// DELETE /api/contacts/:shareId — remove a contact by shareId
router.delete(
  '/:shareId',
  ensureAuth,
  async (req, res) => {
    const { shareId } = req.params;
    const currentUser = (req.user as any);
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

router.post(
  '/',
  ensureAuth,
  async (req, res) => {
    const { shareId } = req.body;
    if (!shareId) {
      res.status(400).json({ error: 'shareId is required' });
      return;
    }

    // Verify the contact user exists
    const contactUser = await UserModel.findOne({ shareId }).select('_id');
    if (!contactUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const currentUser = req.user as any;
    if (!Types.ObjectId.isValid(currentUser._id)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }
    const userId = currentUser._id.toString();

    // Add shareId to contacts array, avoid duplicates
    try {
      const updated = await UserModel.findByIdAndUpdate(
        userId,
        { $addToSet: { contacts: shareId } },
        { new: true }
      ).exec();

      if (!updated) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(201).json({ shareId });
    } catch (err) {
      console.error('Add contact error:', err);
      res.status(500).json({ error: 'Failed to add contact' });
    }
  }
);

export default router;