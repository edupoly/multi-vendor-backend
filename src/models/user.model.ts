import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "buyer" | "vendor";

  // Buyer
  cart?: {
    product: Types.ObjectId;
    quantity: number;
    date: Date;
  }[];

  savedAddresses?: {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }[];

  // Vendor
  products?: number;
  orders?: number;
  delivered?: number;
  pendingDelivery?: number;
  returns?: number;
}

const userSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["buyer", "vendor"], required: true },

    // Buyer Cart
    cart: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
      },
    ],

    // Buyer Saved Addresses
    savedAddresses: [
      {
        fullName: { type: String },
        phone: { type: String },
        addressLine: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String },
      },
    ],

    // Vendor Stats
    products: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    pendingDelivery: { type: Number, default: 0 },
    returns: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>("User", userSchema);
