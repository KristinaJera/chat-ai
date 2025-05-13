import dotenv from 'dotenv';
import path from 'path';

// ── 1. Dotenv setup ──────────────────────────────────────────────────────
// Only load a .env file when NOT in production
if (process.env.NODE_ENV !== 'production') {
  // this will look for “server/.env” by default
  dotenv.config();
}

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose, { Types } from 'mongoose';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import fs from 'fs';
import messagesRoutes from './routes/messages';
import aiRoutes from './routes/ai';
import chatsRoutes from './routes/chats';
import usersRoutes from './routes/users';
import contactsRoutes from './routes/contacts';
import User from './models/User';
import Chat from './models/Chat';
import Message from './models/Message';

// ── 2. Env vars & sanity checks ─────────────────────────────────────────
const {
  MONGO_URI = '',
  CLIENT_ORIGIN = '',
  BACKEND_URL = '',
  SESSION_SECRET = '',
  NODE_ENV,
  PORT = '3001',
} = process.env;

if (!MONGO_URI)       throw new Error('MONGO_URI must be set');
if (!CLIENT_ORIGIN)   throw new Error('CLIENT_ORIGIN must be set');
if (!BACKEND_URL)     throw new Error('BACKEND_URL must be set');
if (!SESSION_SECRET)  throw new Error('SESSION_SECRET must be set');

const IN_PROD  = NODE_ENV === 'production';
const PORT_NUM = parseInt(PORT, 10);

// Allow extra localhost origins in dev
const ALLOWED_ORIGINS = IN_PROD
  ? [CLIENT_ORIGIN]
  : [
      CLIENT_ORIGIN,
      'http://localhost:5173',
      'http://localhost:3000',
      // add any other local preview ports here
    ];

// ── 3. Connect to MongoDB ────────────────────────────────────────────────
mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    tls: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected');

    // ── 4. Express setup ────────────────────────────────────────────────
    const app = express();
    app.set('trust proxy', 1);

    // Security & perf
    app.use(helmet());
    app.use(compression());
    app.use(morgan('combined'));

    // Body & cookies
    app.use(express.json({ limit: '10kb' }));
    app.use(cookieParser());

    // CORS
    app.use(
      cors({
        origin: (origin, cb) => {
          if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            return cb(null, true);
          }
          cb(new Error(`Origin ${origin} not allowed by CORS`));
        },
        credentials: true,
      })
    );

    // ── 5. Session & Passport ────────────────────────────────────────────
    const sessionMiddleware = session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: MONGO_URI }),
      cookie: {
        secure: IN_PROD,
        sameSite:IN_PROD ? 'none' : 'lax', 
        path: '/',  
        maxAge: 1000 * 60 * 60 * 24 * 7,       // 7 days
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

    function ensureAuth(req: any, res: any, next: any) {
      return req.isAuthenticated() ? next() : res.sendStatus(401);
    }

    // ── 6. HTTP & Socket.IO ──────────────────────────────────────────────
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: ALLOWED_ORIGINS,
        credentials: true,
        methods: ['GET', 'POST'],
      },
    });

    // Share sessions with sockets
    io.use((socket, next) =>
      sessionMiddleware(socket.request as any, {} as any, next as any)
    );
    io.use((socket, next) => {
      const req = socket.request as any;
      const uid = req.session?.passport?.user;
      if (uid) {
        socket.data.userId = uid;
        return next();
      }
      next(new Error('Unauthorized'));
    });

    io.on('connection', (socket) => {
      console.log('👤', socket.id, 'connected');
      socket.on('joinChat', async (chatId: string) => {
        const chat = await Chat.findById(chatId);
        if (chat?.participants.some((p) => p.equals(socket.data.userId))) {
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
      socket.on(
        'typing:start',
        (p) => socket.to(p.chatId).emit('typing', { ...p, isTyping: true })
      );
      socket.on(
        'typing:stop',
        (p) => socket.to(p.chatId).emit('typing', { ...p, isTyping: false })
      );
    });

    // ── 7. REST Routes ────────────────────────────────────────────────────
    app.get(
      '/auth/google',
      passport.authenticate('google', { scope: ['profile', 'email'] })
    );
    app.get(
      '/auth/google/callback',
      passport.authenticate('google', { failureRedirect: '/login' }),
      (_req, res) => res.redirect(CLIENT_ORIGIN)
    );

    app.get('/api/users/me', ensureAuth, (req, res) => {
      const u = req.user as any;
      res.json({
        id: u._id,
        name: u.name,
        email: u.email,
        shareId: u.shareId,
      });
    });

// JSON‐style logout for axios/fetch POST /auth/logout
app.post('/auth/logout', (req, res) => {
  req.logout(err => {
    if (err) console.error('Logout error:', err);
    req.session.destroy(err => {
      if (err) console.error('Session destroy error:', err);
      res.clearCookie('connect.sid');
      res.json({ ok: true });
    });
  });
});

    app.use('/api/messages', messagesRoutes(io));
    app.use('/api/ai', aiRoutes);
    app.use('/api/chats', chatsRoutes);
    app.use('/api/users', usersRoutes);
    app.use('/api/contacts', contactsRoutes);

    // ── 8. Serve Frontend in Prod ────────────────────────────────────────
    if (IN_PROD) {
      const buildDir = path.join(__dirname, '../client/dist');
      if (fs.existsSync(buildDir)) {
        app.use(express.static(buildDir));
        app.get(/.*/, (_req, res) => {
          res.sendFile(path.join(buildDir, 'index.html'));
        });
      }
    }

    // ── 9. Start ─────────────────────────────────────────────────────────
    httpServer.listen(PORT_NUM, () => {
      console.log(`🚀 Server listening on port ${PORT_NUM}`);
    });
  })
  .catch((err) => {
    console.error('❌ Startup error:', err);
    process.exit(1);
  });
