import { Request, Response } from "express";
import Order from "../models/order.model";
import Product from "../models/product.model";
import User, { IUser } from "../models/user.model";

interface AuthRequest extends Request {
  user?: any;
}

export const updateCart = async (req: any, res: Response) => {
  const { userId, cartItems } = req.body;
  console.log(cartItems);
  const user = await User.findByIdAndUpdate(userId, {
    $set: { cart: [...cartItems] },
  });
  res.send({ msg: "Cart updated", cart: user?.cart });
};

export const createOrder = async (req: any, res: Response) => {
  // console.log(req.body);
  const { userId } = req.body;
  const user = await User.findById(userId, { cart: 1 });
  console.log("createOrder", user?.cart);
  user?.cart?.forEach(async (item: any) => {
    const order = new Order({
      buyer: user?._id,
      status: "pending",
      productId: item._id,
      quantity: item.quantity,
      vendorId: item.vendor,
      price: item.price,
      name: item.name,
      description: item.description,
      image: item.image,
    });
    await order.save();
    await Product.findByIdAndUpdate(item._id, {
      $inc: { stock: -item.quantity },
    });
  });
  await User.findByIdAndUpdate(userId, {
    $set: { cart: [] },
  });
  res.send({ msg: "Cart updated" });
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ buyer: req.user.id }).populate(
      "products.product",
      "name price",
    );
    res.json(orders);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send("Server Error");
  }
};

export const getVendorOrders = async (req: AuthRequest, res: Response) => {
  try {
    console.log(req.user.id);
    const orders = await Order.find({ vendorId: req.user.id });
    res.json(orders);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send("Server Error");
  }
};

// export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
//   const { status } = req.body;
//   try {
//     const order = await Order.findById(req.params.id);

//     if (!order) {
//       return res.status(404).json({ msg: "Order not found" });
//     }

//     // Check if the vendor owns one of the products in the order
//     const products = await Product.find({ vendor: req.user.id });
//     const productIds = products.map((p) => p._id.toString());

//     const orderProductIds = order.products.map((p) => p.product.toString());

//     const isVendorInOrder = orderProductIds.some((op) =>
//       productIds.includes(op),
//     );

//     if (!isVendorInOrder) {
//       return res.status(401).json({ msg: "Not authorized" });
//     }

//     const updatedOrder = await Order.findByIdAndUpdate(
//       req.params.id,
//       { $set: { status } },
//       { new: true },
//     );

//     res.json(updatedOrder);
//   } catch (err) {
//     console.error((err as Error).message);
//     res.status(500).send("Server Error");
//   }
// };
