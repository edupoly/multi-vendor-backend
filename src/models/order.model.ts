import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';
import { IProduct } from './product.model';

export interface IOrder extends Document {
  buyer: IUser['_id'];
  products: {
    product: IProduct['_id'];
    quantity: number;
  }[];
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

const orderSchema: Schema = new Schema({
  buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', orderSchema);
