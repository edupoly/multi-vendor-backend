import { Router } from 'express';
import {
  createStore,
  getStores,
  getStoreById,
  updateStore,
} from '../controllers/store.controller';
import { auth, isVendor } from '../middleware/auth.middleware';

const router = Router();

router.post('/', [auth, isVendor], createStore);
router.get('/', getStores);
router.get('/:id', getStoreById);
router.put('/:id', [auth, isVendor], updateStore);

export default router;