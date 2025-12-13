import express from 'express';
import { getUsers, getUser, updateUser, deleteUser } from '../controllers/user.controller';
import { protect, admin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateUserValidator } from '../middleware/validators';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);
router.use(admin);

// User routes
router.route('/').get(getUsers);

router.route('/:id').get(getUser).put(validate(updateUserValidator), updateUser).delete(deleteUser);

export default router;
