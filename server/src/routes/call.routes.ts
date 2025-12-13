import express from 'express';
import {
  createCall,
  getCallsByAgent,
  getCallsByCandidate,
  updateCall,
  updateCallStatus,
} from '../controllers/call.controller';
import { initiateCall, getCallDetails } from '../controllers/interview.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// POST /api/calls - Create a new call
router.route('/').post(createCall);

// GET /api/calls/agent/:agentId - Get all calls for an agent
router.route('/agent/:agentId').get(getCallsByAgent);

// GET /api/calls/candidate/:candidateId - Get all calls for a candidate
router.route('/candidate/:candidateId').get(getCallsByCandidate);

// PATCH /api/calls/:id - Update call details
// PATCH /api/calls/:id/status - Update call status
router.route('/:id').patch(updateCall);
router.route('/:id/status').patch(updateCallStatus);

// Interview routes (Dinodial integration)
// POST /api/calls/:id/initiate - Initiate an AI phone screening interview
router.route('/:id/initiate').post(initiateCall);

// GET /api/calls/:id/details - Get call details with Dinodial information
router.route('/:id/details').get(getCallDetails);

export default router;
