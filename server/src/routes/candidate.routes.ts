import express from 'express';
import {
  getCandidates,
  getCandidate,
  createCandidate,
  updateCandidate,
  updateCandidateStatus,
  deleteCandidate,
} from '../controllers/candidate.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.route('/').get(getCandidates).post(createCandidate);

router.route('/:id').get(getCandidate).put(updateCandidate).delete(deleteCandidate);

router.route('/:id/status').patch(updateCandidateStatus);

export default router;
