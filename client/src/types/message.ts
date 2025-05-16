export interface Message {
  _id: string;
  roomId: string;
  chat?: string; 
  authorId: string;
  body: string;
  replyTo?: string;
  status: "sent" | "edited" | "deleted";
  createdAt: string; 
  updatedAt: string; 
   attachments?: Attachment[];
}
export interface Attachment {
  filename: string;
  mimeType: string;
  url: string;
  size: number;
}