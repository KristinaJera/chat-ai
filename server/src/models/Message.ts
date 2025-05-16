// in models/Message.ts
import { Schema, model } from "mongoose";

const AttachmentSchema = new Schema({
  filename: String,
  mimeType: String,
  url: String,
  size: Number,
}, { _id: false });

const MessageSchema = new Schema({
  roomId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
  authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  body: String,
  attachments: [AttachmentSchema],
  replyTo: { type: Schema.Types.ObjectId, ref: "Message" },
  status: String,
}, { timestamps: true });

export default model("Message", MessageSchema);
