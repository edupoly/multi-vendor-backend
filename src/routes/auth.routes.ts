import { Router } from 'express';
import { register, login, addToCart } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post("/addToCart", addToCart);
export default router;
