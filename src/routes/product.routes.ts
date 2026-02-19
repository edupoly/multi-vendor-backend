import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';
import { auth, isVendor } from '../middleware/auth.middleware';

const router = Router();

router.post('/', [auth, isVendor], createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', [auth, isVendor], updateProduct);
router.delete('/:id', [auth, isVendor], deleteProduct);

export default router;