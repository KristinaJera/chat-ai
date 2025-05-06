import { Schema, model, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IUser extends Document {
  googleId: string;
  name: string;
  email: string;
  shareId: string;
}

const userSchema = new Schema<IUser>({
  googleId: { type: String, required: true, unique: true },
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  shareId:  { type: String, required: true, unique: true, default: uuidv4 },
});

export default model<IUser>('User', userSchema);