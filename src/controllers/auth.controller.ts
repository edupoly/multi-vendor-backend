import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user.model";

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({
      name,
      email,
      password,
      role,
    });

    const salt = await bcrypt.genSalt(10);
    if (user.password) {
      user.password = await bcrypt.hash(user.password, salt);
    }

    if (role === "vendor") {
        user.products= 0
        user.orders= 0
        user.delivered= 0
        user.pendingDelivery= 0
        user.returns= 0
    }else if(role === "buyer"){
      user.cart = []
      user.savedAddresses=[]
    }
    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      },
    );
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send("Server error");
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;

        const responseData: any = {
          token,
          id: user._id.toString(),
          role: user.role,
          name: user.name,
          email: user.email,
        };

        // 👤 If Buyer → send cart & addresses
        if (user.role === "buyer") {
          responseData.cart = user.cart || [];
          responseData.savedAddresses = user.savedAddresses || [];
        }

        // 🏪 If Vendor → send stats
        if (user.role === "vendor") {
          responseData.products = user.products ?? 0;
          responseData.orders = user.orders ?? 0;
          responseData.delivered = user.delivered ?? 0;
          responseData.pendingDelivery = user.pendingDelivery ?? 0;
          responseData.returns = user.returns ?? 0;
        }
        res.json({ ...responseData });
      },
    );
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send("Server error");
  }
};

export const addToCart = async (req: any, res: Response) => {
  const { userId, productId, quantity } = req.body;

  try {
    // 1️⃣ Validate productId
    if (!productId) {
      return res.status(400).json({ msg: "Product ID is required" });
    }

    // 2️⃣ Find user
    const user = await User.findById(userId);
    console.log("existingItem", user);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // 3️⃣ Only buyers can add to cart
    if (user.role !== "buyer") {
      return res.status(403).json({ msg: "Only buyers can add to cart" });
    }

    // 4️⃣ Initialize cart if undefined
    if (!user.cart) user.cart = [];

    const qty = quantity && quantity > 0 ? quantity : 1;

    // 5️⃣ Check if product already exists in cart
    const existingItem = user.cart.find(item => item.product === productId);


    if (existingItem) {
      existingItem.quantity += qty; // Increment quantity
    } else {
      user.cart.push({ product: productId, quantity: qty }); // Add new item
    }

    // 6️⃣ Save user
    await user.save();

    // 7️⃣ Respond with updated cart
    res.json({
      msg: "Product added to cart",
      cart: user.cart,
    });

  } catch (err) {
    console.error("Add to Cart Error:", err);
    res.status(500).json({ msg: "Server error", error: err });
  }
};