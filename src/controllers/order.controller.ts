import { Request, Response } from 'express';
import Order from '../models/order.model';
import Product from '../models/product.model';

interface AuthRequest extends Request {
    user?: any;
}

export const createOrder = async (req: AuthRequest, res: Response) => {
    const { products } = req.body;

    try {
        let totalPrice = 0;
        const productsWithPrice = await Promise.all(
            products.map(async (p: { product: string; quantity: number }) => {
                const product = await Product.findById(p.product);
                if (!product) {
                    throw new Error(`Product with id ${p.product} not found`);
                }
                if (product.stock < p.quantity) {
                    throw new Error(`Not enough stock for ${product.name}`);
                }
                totalPrice += product.price * p.quantity;
                return { product: p.product, quantity: p.quantity, price: product.price };
            })
        );

        const newOrder = new Order({
            buyer: req.user.id,
            products: productsWithPrice,
            totalPrice,
        });

        const order = await newOrder.save();
        
        // Decrement stock
        await Promise.all(
            products.map(async (p: { product: string; quantity: number }) => {
                await Product.findByIdAndUpdate(p.product, { $inc: { stock: -p.quantity } });
            })
        );

        res.json(order);
    } catch (err) {
        console.error((err as Error).message);
        res.status(500).send('Server Error');
    }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
    try {
        const orders = await Order.find({ buyer: req.user.id }).populate('products.product', 'name price');
        res.json(orders);
    } catch (err) {
        console.error((err as Error).message);
        res.status(500).send('Server Error');
    }
};

export const getVendorOrders = async (req: AuthRequest, res: Response) => {
    try {
        // Find products belonging to the vendor
        const products = await Product.find({ vendor: req.user.id });
        const productIds = products.map(p => p._id);

        // Find orders containing those products
        const orders = await Order.find({ 'products.product': { $in: productIds } })
            .populate('buyer', 'name email')
            .populate('products.product', 'name price');

        res.json(orders);
    } catch (err) {
        console.error((err as Error).message);
        res.status(500).send('Server Error');
    }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
    const { status } = req.body;
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        // Check if the vendor owns one of the products in the order
        const products = await Product.find({ vendor: req.user.id });
        const productIds = products.map(p => p._id.toString());
        
        const orderProductIds = order.products.map(p => p.product.toString());

        const isVendorInOrder = orderProductIds.some(op => productIds.includes(op));

        if (!isVendorInOrder) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: { status } },
            { new: true }
        );

        res.json(updatedOrder);
    } catch (err) {
        console.error((err as Error).message);
        res.status(500).send('Server Error');
    }
};
