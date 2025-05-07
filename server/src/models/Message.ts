import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMessage extends Document {
  roomId: Types.ObjectId;
  authorId: Types.ObjectId;
  body: string;
  replyTo?: Types.ObjectId;
  status?: "sent" | "edited" | "deleted";
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true },
    replyTo: { type: Schema.Types.ObjectId, ref: "Message" },
    status: { type: String, enum: ["sent", "edited", "deleted"], default: "sent" },
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>("Message", MessageSchema);
