import express from 'express';
import { initiateCall, getCallDetails } from '../controllers/interview.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// POST /api/calls/:id/initiate - Initiate an AI phone screening interview
router.route('/:id/initiate').post(initiateCall);

// GET /api/calls/:id/details - Get call details with Dinodial information
router.route('/:id/details').get(getCallDetails);

export default router;
