import { Request, Response } from "express";
import Order from "../models/order.model";
import Product from "../models/product.model";
import User, { IUser } from "../models/user.model";

interface AuthRequest extends Request {
  user?: any;
}

export const updateCart = async (req: any, res: Response) => {
  console.log(req.body);
  const { userId, cartItems } = req.body;
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
      product: item._id,
      quantity: item.quantity,
      status: "pending",
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

// export const createOrder = async (req: AuthRequest, res: Response) => {
//   const { buyerId, products } = req.body;
//   console.log("Creating order:", { buyerId, products });
//   try {
//     let totalPrice = 0;
//     const productsWithPrice = await Promise.all(
//       products.map(async (p) => {
//         const product = await Product.findById(p._id);
//         if (!product) {
//           throw new Error(`Product with id ${p._id} not found`);
//         }
//         if (product.stock < p.quantity) {
//           throw new Error(`Not enough stock for ${product.name}`);
//         }
//         totalPrice += product.price * p.quantity;
//         return {
//           product: p.product,
//           quantity: p.quantity,
//           price: product.price,
//         };
//       }),
//     );

//     const newOrder = new Order({
//       buyerId,
//       products: productsWithPrice,
//       totalPrice,
//     });

//     const order = await newOrder.save();

//     // Decrement stock
//     await Promise.all(
//       products.map(async (p: { product: string; quantity: number }) => {
//         await Product.findByIdAndUpdate(p.product, {
//           $inc: { stock: -p.quantity },
//         });
//       }),
//     );

//     res.json(order);
//   } catch (err) {
//     console.error((err as Error).message);
//     res.status(500).send("Server Error");
//   }
// };

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

// export const getVendorOrders = async (req: AuthRequest, res: Response) => {
//   try {
//     // Find products belonging to the vendor
//     const products = await Product.find({ vendor: req.user.id });
//     const productIds = products.map((p) => p._id);

//     // Find orders containing those products
//     const orders = await Order.find({ "products.product": { $in: productIds } })
//       .populate("buyer", "name email")
//       .populate("products.product", "name price");

//     res.json(orders);
//   } catch (err) {
//     console.error((err as Error).message);
//     res.status(500).send("Server Error");
//   }
// };

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
