import { Request, Response } from "express";
import Product from "../models/product.model";
import User, { IUser } from "../models/user.model";

interface AuthRequest extends Request {
  user?: any;
}

export const createProduct = async (req: AuthRequest, res: Response) => {
  const { name, description, price, stock, image } = req.body;
  try {
    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      image,
      vendor: req.user.id,
    });

    const product = await newProduct.save();
    await User.findByIdAndUpdate(req.user.id, { $inc: { products: 1 } }, { new: true });
    res.json(product);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send("Server Error");
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().populate("vendor", "name");
    res.json(products);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send("Server Error");
  }
};

export const getProductsByVendorId = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ vendor: req.params.id }).populate(
      "vendor",
      "name",
    );
    res.json(products);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send("Server Error");
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "vendor",
      "name",
    );
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error((err as Error).message);
    if ((err as any).kind === "ObjectId") {
      return res.status(404).json({ msg: "Product not found" });
    }
    res.status(500).send("Server Error");
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  const { name, description, price, stock, image } = req.body;

  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Check if the user owns the product
    if (product.vendor.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: { name, description, price, stock, image } },
      { new: true },
    );

    res.json(product);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send("Server Error");
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Check if the user owns the product
    if (product.vendor.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    await Product.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(req.user.id, { $inc: { products: -1 } }, { new: true }).where("products").gt(0);

    res.json({ msg: "Product removed" });
  } catch (err) {
    console.error((err as Error).message);
    if ((err as any).kind === "ObjectId") {
      return res.status(404).json({ msg: "Product not found" });
    }
    res.status(500).send("Server Error");
  }
};
