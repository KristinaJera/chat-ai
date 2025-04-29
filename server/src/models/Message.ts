import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    roomId: { type: String, required: true, index: true },
    authorId: { type: String, required: true },
    body: { type: String, default: "" },
    replyTo: { type: String },          // message _id as plain string
    status: { type: String, default: "sent" }, // sent | edited | deleted
  },
  { timestamps: true }
);

export default model("Message", messageSchema);
