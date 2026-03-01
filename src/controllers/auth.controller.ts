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
          responseData.products = user.products || 0;
          responseData.orders = user.orders || 0;
          responseData.delivered = user.delivered || 0;
          responseData.pendingDelivery = user.pendingDelivery || 0;
          responseData.returns = user.returns || 0;
        }
        res.json({ ...responseData });
      },
    );
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send("Server error");
  }
};
