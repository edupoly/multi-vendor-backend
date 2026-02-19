import { Request, Response } from 'express';
import Store from '../models/store.model';

interface AuthRequest extends Request {
    user?: any;
}

export const createStore = async (req: AuthRequest, res: Response) => {
    const { name, description } = req.body;
    try {
        const store = await Store.findOne({ vendor: req.user.id });

        if (store) {
            return res.status(400).json({ msg: 'Vendor already has a store' });
        }

        const newStore = new Store({
            name,
            description,
            vendor: req.user.id,
        });

        const savedStore = await newStore.save();
        res.json(savedStore);
    } catch (err) {
        console.error((err as Error).message);
        res.status(500).send('Server Error');
    }
};

export const getStores = async (req: Request, res: Response) => {
    try {
        const stores = await Store.find().populate('vendor', 'name');
        res.json(stores);
    } catch (err) {
        console.error((err as Error).message);
        res.status(500).send('Server Error');
    }
};

export const getStoreById = async (req: Request, res: Response) => {
    try {
        const store = await Store.findById(req.params.id).populate('vendor', 'name');
        if (!store) {
            return res.status(404).json({ msg: 'Store not found' });
        }
        res.json(store);
    } catch (err) {
        console.error((err as Error).message);
        if ((err as any).kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Store not found' });
        }
        res.status(500).send('Server Error');
    }
};

export const updateStore = async (req: AuthRequest, res: Response) => {
    const { name, description } = req.body;

    try {
        let store = await Store.findById(req.params.id);

        if (!store) {
            return res.status(404).json({ msg: 'Store not found' });
        }

        // Check if the user owns the store
        if (store.vendor.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        store = await Store.findByIdAndUpdate(
            req.params.id,
            { $set: { name, description } },
            { new: true }
        );

        res.json(store);
    } catch (err) {
        console.error((err as Error).message);
        res.status(500).send('Server Error');
    }
};