import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getVendorOrders,
  updateOrderStatus,
} from '../controllers/order.controller';
import { auth, isBuyer, isVendor } from '../middleware/auth.middleware';

const router = Router();

router.post('/', [auth, isBuyer], createOrder);
router.get('/myorders', [auth, isBuyer], getMyOrders);
router.get('/vendor', [auth, isVendor], getVendorOrders);
router.put('/:id/status', [auth, isVendor], updateOrderStatus);

export default router;
