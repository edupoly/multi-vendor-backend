import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

interface AuthRequest extends Request {
  user?: any;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

export const isVendor = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.user.id);
        if (user && user.role === 'vendor') {
            next();
        } else {
            res.status(403).json({ msg: 'Access denied. Vendors only.' });
        }
    } catch (err) {
        res.status(500).send('Server error');
    }
};

export const isBuyer = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.user.id);
        if (user && user.role === 'buyer') {
            next();
        } else {
            res.status(403).json({ msg: 'Access denied. Buyers only.' });
        }
    } catch (err) {
        res.status(500).send('Server error');
    }
};
