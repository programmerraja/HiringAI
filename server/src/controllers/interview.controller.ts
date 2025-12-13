import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Call } from '../models/call.model';
import { Agent } from '../models/agent.model';
import { Candidate } from '../models/candidate.model';
import { Company } from '../models/company.model';
import { AppError } from '../middleware/errorHandler';
import { dinodialService } from '../services/dinodial.service';
import { buildXMLPrompt, buildEvaluationTool } from '../utils/promptBuilder';
import { logger } from '../utils/logger';

/**
 * @desc    Initiate an AI phone screening interview
 * @route   POST /api/calls/:id/initiate
 * @access  Private
 * Requirements: 1.1, 1.2
 */
export const initiateCall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Validate call ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: AppError = new Error('Invalid call ID format');
      error.statusCode = 400;
      return next(error);
    }

    // Fetch the call
    const call = await Call.findById(id);
    if (!call) {
      const error: AppError = new Error('Call not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if call already initiated
    if (call.dinodialCallId !== null) {
      const error: AppError = new Error('Interview already initiated');
      error.statusCode = 409;
      return next(error);
    }

    // Verify agent exists and belongs to user
    const agent = await Agent.findOne({
      _id: call.agentId,
      userId: req.user.id,
    });

    if (!agent) {
      const error: AppError = new Error('Agent not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if agent is active
    if (agent.status !== 'active') {
      const error: AppError = new Error('Agent must be active to initiate calls');
      error.statusCode = 400;
      return next(error);
    }


    // Fetch the candidate
    const candidate = await Candidate.findById(call.candidateId);
    if (!candidate) {
      const error: AppError = new Error('Candidate not found');
      error.statusCode = 404;
      return next(error);
    }

    // Validate candidate has phone number
    if (!candidate.phone || candidate.phone.trim() === '') {
      const error: AppError = new Error('Candidate phone number required');
      error.statusCode = 400;
      return next(error);
    }

    // Fetch company context
    const company = await Company.findOne({ userId: req.user.id });
    const companyContext = company?.context;

    // Build the XML prompt and evaluation tool
    const prompt = buildXMLPrompt(agent, candidate, companyContext);
    const evaluationTool = buildEvaluationTool(agent.pillars);

    try {
      // Call Dinodial API
      const dinodialResponse = await dinodialService.makeCall(
        candidate.phone,
        prompt,
        evaluationTool
      );

      // Update call record with Dinodial ID and status
      call.dinodialCallId = dinodialResponse.data.id;
      call.status = 'in_progress';
      call.prompt = prompt;
      await call.save();

      logger.info(`Interview initiated for call ${id}, dinodialCallId: ${dinodialResponse.data.id}`);

      res.status(200).json({
        success: true,
        data: {
          callId: call._id,
          dinodialCallId: dinodialResponse.data.id,
          status: call.status,
        },
      });
    } catch (dinodialError) {
      // Update call status to failed
      call.status = 'failed';
      await call.save();

      logger.error(`Failed to initiate interview for call ${id}`);

      const error: AppError = new Error('External service unavailable');
      error.statusCode = 503;
      return next(error);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get call details with Dinodial information
 * @route   GET /api/calls/:id/details
 * @access  Private
 * Requirements: 3.1
 */
export const getCallDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Validate call ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: AppError = new Error('Invalid call ID format');
      error.statusCode = 400;
      return next(error);
    }

    // Fetch the call
    const call = await Call.findById(id);
    if (!call) {
      const error: AppError = new Error('Call not found');
      error.statusCode = 404;
      return next(error);
    }

    // Verify agent exists and belongs to user
    const agent = await Agent.findOne({
      _id: call.agentId,
      userId: req.user.id,
    });

    if (!agent) {
      const error: AppError = new Error('Call not found');
      error.statusCode = 404;
      return next(error);
    }

    // Fetch the candidate
    const candidate = await Candidate.findById(call.candidateId);
    if (!candidate) {
      const error: AppError = new Error('Candidate not found');
      error.statusCode = 404;
      return next(error);
    }

    // Build response
    const response: {
      success: boolean;
      data: {
        call: typeof call;
        candidate: typeof candidate;
        agent: typeof agent;
        dinodialDetails?: {
          status: string;
          analysis?: Record<string, any>;
          recordingUrl?: string;
          duration?: number;
        };
      };
    } = {
      success: true,
      data: {
        call,
        candidate,
        agent,
      },
    };

    // If call has dinodialCallId, fetch details from Dinodial
    if (call.dinodialCallId !== null) {
      try {
        const dinodialDetails = await dinodialService.getCallDetail(call.dinodialCallId);

        // Map Dinodial status to our status if needed
        const statusMap: Record<string, 'scheduled' | 'in_progress' | 'completed' | 'failed'> = {
          initiated: 'in_progress',
          in_progress: 'in_progress',
          completed: 'completed',
          failed: 'failed',
        };

        // Update local call status if it changed
        const mappedStatus = statusMap[dinodialDetails.status] || call.status;
        let needsSave = false;

        if (call.status !== mappedStatus) {
          call.status = mappedStatus;
          needsSave = true;
        }

        // Fetch and store recording URL if call is completed and we don't have it yet
        let recordingUrl = call.recordingUrl;
        if (mappedStatus === 'completed' && !call.recordingUrl && call.dinodialCallId) {
          try {
            recordingUrl = await dinodialService.getRecordingUrl(call.dinodialCallId);
            call.recordingUrl = recordingUrl;
            needsSave = true;
            logger.info(`Recording URL fetched for call ${id}`);
          } catch (recordingErr) {
            logger.error(`Failed to fetch recording URL for call ${id}`);
          }
        }

        if (needsSave) {
          await call.save();
        }

        // Build dinodialDetails response
        response.data.dinodialDetails = {
          status: dinodialDetails.status,
        };

        // Only include analysis if call is completed
        if (dinodialDetails.status === 'completed' && dinodialDetails.analysis) {
          response.data.dinodialDetails.analysis = dinodialDetails.analysis;
          if (!call.analysis) {
            call.analysis = dinodialDetails.analysis;
            needsSave = true;
          }
        }

        // Include recording URL if available (from DB or freshly fetched)
        if (recordingUrl) {
          response.data.dinodialDetails.recordingUrl = recordingUrl;
        }

        // Include duration if available
        if (dinodialDetails.duration !== undefined) {
          response.data.dinodialDetails.duration = dinodialDetails.duration;
        }
      } catch (dinodialError) {
        // Log error but don't fail the request - return what we have
        logger.error(`Failed to fetch Dinodial details for call ${id}`);
        response.data.dinodialDetails = {
          status: call.status,
        };
      }
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
