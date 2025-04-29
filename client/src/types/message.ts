// src/types/message.ts

export interface Message {
    _id: string;
    roomId: string;
    authorId: string;
    body: string;
    replyTo?: string;
    status: "sent" | "edited" | "deleted";
    createdAt: string;   // ISO date string
    updatedAt: string;   // ISO date string
  }
  