import express from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import messagesRoutes from './routes/messages';
import aiRoutes from './routes/ai';
import chatsRoutes from './routes/chats';
import usersRoutes from './routes/users';
import User from './models/User';
import Chat from './models/Chat';
import Message from './models/Message';
import { Types } from 'mongoose';


dotenv.config();
const MONGO_URI = process.env.MONGO_URI!;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN!;
if (!CLIENT_ORIGIN) {
  throw new Error('CLIENT_ORIGIN must be set');
}
const PORT = Number(process.env.PORT) || 3001;
const BACKEND_URL = process.env.BACKEND_URL!;
// Ensure SESSION_SECRET is defined
if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable must be set');
}

// ----- Connect to MongoDB and start server on success -----
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  tls: true,
})
  .then(() => {
    console.log('MongoDB connected');

    // ----- Express App Setup -----
    const app = express();
    app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
    app.use(express.json());
    const IN_PROD = process.env.NODE_ENV === 'production';
    // ----- Session & Passport -----
    
    app.set('trust proxy', 1);
    app.use(
      session({
        secret: process.env.SESSION_SECRET!,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: MONGO_URI }),
           cookie: {
      secure: IN_PROD,      
      sameSite: 'none',    
      maxAge: 1000 * 60 * 60 * 24 * 7, 
    },
      })
    );
    app.use(passport.initialize());
    app.use(passport.session());

    // Passport strategies
    passport.serializeUser((user: any, done) => done(null, user._id));
    passport.deserializeUser(async (id: string, done) => {
      try {
        const u = await User.findById(id);
        done(null, u);
      } catch (e) {
        done(e as any);
      }
    });

    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          callbackURL: `${BACKEND_URL}/auth/google/callback`,
        },
        async (_, __, profile, done) => {
          let user = await User.findOne({ googleId: profile.id });
          if (!user) {
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails?.[0].value,
            });
          }
          done(null, user);
        }
      )
    );

    // Utility to ensure authentication
    function ensureAuth(req: any, res: any, next: any) {
      return req.isAuthenticated() ? next() : res.sendStatus(401);
    }

    // ----- HTTP & Socket.IO Setup -----
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: CLIENT_ORIGIN,     
        credentials: true,         
        methods: ["GET","POST"],
      },
    });

    io.use((socket, next) => {
      const req = socket.request as any;
      const userId = req.session?.passport?.user;
      if (userId) {
        socket.data.userId = userId;
        return next();
      }
      next(new Error('Unauthorized'));
    });

    io.on('connection', (socket) => {
      console.log('👤', socket.id, 'connected');
      socket.on('joinChat', async (chatId: string) => {
        const chat = await Chat.findById(chatId);
        if (chat?.participants.some(p => p.equals(socket.data.userId))) {
          socket.join(chatId);
        }
      });
      socket.on('message:new', async (data) => {
        const { chatId, body, replyTo } = data as { chatId: string; body: string; replyTo?: string };
        const saved = await Message.create({
          roomId: new Types.ObjectId(chatId),
          authorId: socket.data.userId,
          body,
          replyTo: replyTo ? new Types.ObjectId(replyTo) : undefined,
        });
        io.to(chatId).emit('message:new', saved);
      });
      socket.on('typing:start', p => socket.to(p.chatId).emit('typing', { ...p, isTyping: true }));
      socket.on('typing:stop', p => socket.to(p.chatId).emit('typing', { ...p, isTyping: false }));
    });

    // ----- REST Routes -----
    app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    app.get(
      '/auth/google/callback',
      passport.authenticate('google', { failureRedirect: '/login' }),
      (_req, res) => res.redirect(CLIENT_ORIGIN)
    );

    app.get('/api/users/me', ensureAuth, (req, res) => {
      const user = req.user as any;
      res.json({ id: user._id, name: user.name, email: user.email, shareId: user.shareId });
    });

    app.get('/auth/logout', (req, res) => {
      req.logout(err => {
        if (err) console.error('Logout error:', err);
        req.session.destroy(err => {
          if (err) console.error('Session destroy error:', err);
          res.clearCookie('connect.sid');
          res.redirect(CLIENT_ORIGIN);
        });
      });
    });

    app.use('/api/messages', messagesRoutes(io));
    app.use('/api/ai', aiRoutes);
    app.use('/api/chats', chatsRoutes);
    app.use('/api/users', usersRoutes);

    // ----- Start Server -----
    httpServer.listen(PORT, () => console.log(`API 👉 http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });