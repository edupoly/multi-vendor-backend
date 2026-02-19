import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';

export interface IStore extends Document {
  name: string;
  description: string;
  vendor: IUser['_id'];
}

const storeSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  vendor: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
});

export default mongoose.model<IStore>('Store', storeSchema);
