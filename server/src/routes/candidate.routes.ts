import express from 'express';
import {
  getCandidates,
  getCandidate,
  createCandidate,
  updateCandidate,
  updateCandidateStatus,
  deleteCandidate,
  assignCandidateToAgent,
  removeCandidateFromAgent,
  getUnassignedCandidates,
  parseResume,
} from '../controllers/candidate.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.route('/').get(getCandidates).post(createCandidate);

// Unassigned candidates route (must be before /:id to avoid conflict)
router.route('/unassigned').get(getUnassignedCandidates);

// Parse resume route (must be before /:id to avoid conflict)
router.route('/parse-resume').post(parseResume);

router.route('/:id').get(getCandidate).put(updateCandidate).delete(deleteCandidate);

router.route('/:id/status').patch(updateCandidateStatus);

router.route('/:id/assign').post(assignCandidateToAgent);

router.route('/:id/remove').post(removeCandidateFromAgent);

export default router;
