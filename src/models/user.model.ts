import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'buyer' | 'vendor';

  // Buyer
  cart?: {
    product: Types.ObjectId;
    quantity: number;
  }[];

  savedAddresses?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
    country: string;
  }[];

  // Vendor
  products?: number;
  orders?: number;
  delivered?: number;
  pendingOrder?: number;
  processingOrders?: number;
  shippedOrders?: number;
  cancelledOrders?: number;
  totalRevenue?: number;
  returns?: number;
}

const userSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['buyer', 'vendor'], required: true },

    // Buyer Cart
    cart: {
      type: [
        {
          product: { type: Schema.Types.ObjectId, ref: 'Product' },
          quantity: { type: Number, default: 1 },
        },
      ],
      default: undefined, // <-- important
    },

    savedAddresses: {
      type: [
        {
          fullName: String,
          phone: String,
          address: String,
          city: String,
          state: String,
          pinCode: String,
          country: String,
        },
      ],
      default: undefined, // <-- important
    },

    // Vendor Stats
    products: { type: Number },
    orders: { type: Number },
    delivered: { type: Number },
    pendingOrder: { type: Number },
    processingOrders: { type: Number },
    shippedOrders: { type: Number },
    cancelledOrders: { type: Number },
    totalRevenue: { type: Number },
    returns: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);