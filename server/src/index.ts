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
import path from 'path';
import fs from 'fs';

import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import messagesRoutes from './routes/messages';
import aiRoutes from './routes/ai';
import chatsRoutes from './routes/chats';
import usersRoutes from './routes/users';
import User from './models/User';
import Chat from './models/Chat';
import Message from './models/Message';
import { Types } from 'mongoose';

dotenv.config();

const {
  MONGO_URI = '',
  CLIENT_ORIGIN = '',
  BACKEND_URL = '',
  SESSION_SECRET = '',
  NODE_ENV,
  PORT = '3001'
} = process.env;

if (!MONGO_URI) throw new Error('MONGO_URI must be set');
if (!CLIENT_ORIGIN) throw new Error('CLIENT_ORIGIN must be set');
if (!BACKEND_URL)  throw new Error('BACKEND_URL must be set');
if (!SESSION_SECRET) throw new Error('SESSION_SECRET must be set');

const IN_PROD = NODE_ENV === 'production';
const PORT_NUM = parseInt(PORT, 10);

// Allowed CORS origins
const ALLOWED_ORIGINS = IN_PROD
  ? [CLIENT_ORIGIN]
  : [CLIENT_ORIGIN, 'http://localhost:5173'];

// ----- Connect to MongoDB -----
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  tls: true,
})
.then(() => {
  console.log('MongoDB connected');

  // ----- Express App Setup -----
  const app = express();
  app.set('trust proxy', 1);

  // Security & perf
  app.use(helmet());
  app.use(compression());
  app.use(morgan('combined'));

  // Body parsing & cookies
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());

  // CORS
  app.use(cors({
    origin: (origin, callback) => {
      // allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  }));

  // ----- Session & Passport -----
  const sessionMiddleware = session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: {
      secure: IN_PROD,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  });
  app.use(sessionMiddleware);

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: any, done) => done(null, user._id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const u = await User.findById(id);
      done(null, u);
    } catch (err) {
      done(err as any);
    }
  });

  passport.use(new GoogleStrategy({
      clientID:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:  `${BACKEND_URL}/auth/google/callback`,
    },
    async (_, __, profile, done) => {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          name:     profile.displayName,
          email:    profile.emails?.[0].value,
        });
      }
      done(null, user);
    }
  ));

  function ensureAuth(req: any, res: any, next: any) {
    return req.isAuthenticated() ? next() : res.sendStatus(401);
  }

  // ----- HTTP & Socket.IO -----
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: CLIENT_ORIGIN,
      credentials: true,
      methods: ['GET','POST'],
    }
  });

  // Share session with Socket.IO
  io.use((socket, next) => {
    sessionMiddleware(socket.request as any, {} as any, next as any);
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

  io.on('connection', socket => {
    console.log('👤', socket.id, 'connected');
    socket.on('joinChat', async (chatId: string) => {
      const chat = await Chat.findById(chatId);
      if (chat?.participants.some(p => p.equals(socket.data.userId))) {
        socket.join(chatId);
      }
    });
    socket.on('message:new', async ({ chatId, body, replyTo }) => {
      const saved = await Message.create({
        roomId:   new Types.ObjectId(chatId),
        authorId: socket.data.userId,
        body,
        replyTo: replyTo ? new Types.ObjectId(replyTo) : undefined,
      });
      io.to(chatId).emit('message:new', saved);
    });
    socket.on('typing:start', p => socket.to(p.chatId).emit('typing', { ...p, isTyping: true }));
    socket.on('typing:stop',  p => socket.to(p.chatId).emit('typing', { ...p, isTyping: false }));
  });

  // ----- REST Routes -----
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile','email'] }));
  app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (_req, res) => res.redirect(CLIENT_ORIGIN)
  );

  app.get('/api/users/me', ensureAuth, (req, res) => {
    const user = req.user as any;
    res.json({
      id:      user._id,
      name:    user.name,
      email:   user.email,
      shareId: user.shareId,
    });
  });

  app.get('/auth/logout', (req, res) => {
    req.logout(() => {
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ ok: true });
      });
    });
  });

  app.use('/api/messages', messagesRoutes(io));
  app.use('/api/ai',       aiRoutes);
  app.use('/api/chats',    chatsRoutes);
  app.use('/api/users',    usersRoutes);

  // ----- Serve Frontend in Production -----
  if (IN_PROD) {
    const buildDir = path.join(__dirname, '../client/build');
    if (fs.existsSync(buildDir)) {
      app.use(express.static(buildDir));
      // Regex fallback for SPA routing
      app.get(/.*/, (_req, res) => {
        res.sendFile(path.join(buildDir, 'index.html'));
      });
    }
  }

  // ----- Start Server -----
  httpServer.listen(PORT_NUM, () => {
    console.log(`API 👉 http://localhost:${PORT_NUM}`);
  });

})
.catch(err => {
  console.error('Startup error:', err);
  process.exit(1);
});
