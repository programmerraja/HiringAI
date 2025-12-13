import express from 'express';
import {
  getAgents,
  getAgent,
  createAgent,
  updateAgent,
  updateAgentStatus,
  deleteAgent,
  generateAgentQuestions,
} from '../controllers/agent.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.route('/').get(getAgents).post(createAgent);

router.route('/:id').get(getAgent).put(updateAgent).delete(deleteAgent);

router.route('/:id/status').patch(updateAgentStatus);

router.route('/:id/generate-questions').post(generateAgentQuestions);

export default router;
