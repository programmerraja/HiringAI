import express from 'express';
import { register, login, getMe, logout } from '../controllers/auth.controller';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerValidator, loginValidator } from '../middleware/validators';

const router = express.Router();

// Auth routes
router.post('/register', validate(registerValidator), register);
router.post('/login', validate(loginValidator), login);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

export default router;
