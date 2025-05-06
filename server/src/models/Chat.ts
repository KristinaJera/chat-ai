// backend/src/models/Chat.ts
import { Schema, model, Document, Types } from "mongoose";

export interface IChat extends Document {
  participants: Types.ObjectId[];
  createdAt: Date;
}

const chatSchema = new Schema<IChat>({
  participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  createdAt:    { type: Date, default: Date.now },
});

export default model<IChat>("Chat", chatSchema);
