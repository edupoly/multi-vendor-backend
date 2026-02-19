import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  vendor: IUser['_id'];
  stock: number;
  image: string;
}

const productSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  vendor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  stock: { type: Number, required: true, default: 0 },
  image: { type: String, required: true },
});

export default mongoose.model<IProduct>('Product', productSchema);
