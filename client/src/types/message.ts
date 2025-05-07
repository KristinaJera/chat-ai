export interface Message {
  _id: string;
  roomId: string;
  chat?: string; // optional: kept for legacy structure if needed
  authorId: string;
  authorName: string; // ✅ newly added for display
  body: string;
  replyTo?: string;
  status: "sent" | "edited" | "deleted";
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}