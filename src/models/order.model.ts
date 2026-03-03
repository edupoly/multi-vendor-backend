import mongoose, { Document, Schema } from "mongoose";
import { ICartItem, IUser } from "./user.model";
import { IProduct } from "./product.model";

export interface IOrder extends Document, ICartItem {
  buyer: IUser["_id"];
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
}

const orderSchema: Schema = new Schema(
  {
    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model<IOrder>("Order", orderSchema);
