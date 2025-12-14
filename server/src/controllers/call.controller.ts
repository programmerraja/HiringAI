import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Call } from '../models/call.model';
import { Agent } from '../models/agent.model';
import { Candidate } from '../models/candidate.model';
import { AppError } from '../middleware/errorHandler';
import { dinodialService } from '../services/dinodial.service';
import { logger } from '../utils/logger';
import axios from 'axios';

// @desc    Proxy media content
// @route   GET /api/calls/proxy-media
// @access  Private
export const proxyMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      const error: AppError = new Error('Missing or invalid URL parameter');
      error.statusCode = 400;
      return next(error);
    }

    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
    });

    // Set appropriate headers
    if (response.headers['content-type']) {
      res.setHeader('Content-Type', response.headers['content-type']);
    }
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }

    response.data.pipe(res);
  } catch (error) {
    logger.error('Proxy media error:', error);
    next(error);
  }
};

// @desc    Create a new call
// @route   POST /api/calls
// @access  Private
export const createCall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { candidateId, agentId, scheduledTime } = req.body;

    // Validate candidateId format
    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      const error: AppError = new Error('Invalid candidate ID format');
      error.statusCode = 400;
      return next(error);
    }

    // Validate agentId format
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      const error: AppError = new Error('Invalid agent ID format');
      error.statusCode = 400;
      return next(error);
    }

    // Verify agent exists and belongs to user
    const agent = await Agent.findOne({
      _id: agentId,
      userId: req.user.id,
    });

    if (!agent) {
      const error: AppError = new Error('Agent not found');
      error.statusCode = 404;
      return next(error);
    }

    // Verify candidate exists
    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      const error: AppError = new Error('Candidate not found');
      error.statusCode = 404;
      return next(error);
    }

    // Validate scheduledTime
    if (!scheduledTime) {
      const error: AppError = new Error('Missing required field: scheduledTime');
      error.statusCode = 400;
      return next(error);
    }


    const call = await Call.create({
      candidateId,
      agentId,
      scheduledTime: new Date(scheduledTime),
      status: 'scheduled',
    });

    res.status(201).json({
      success: true,
      data: call,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all calls for an agent
// @route   GET /api/calls/agent/:agentId
// @access  Private
export const getCallsByAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { agentId } = req.params;

    // Validate agentId format
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      const error: AppError = new Error('Invalid agent ID format');
      error.statusCode = 400;
      return next(error);
    }

    // Verify agent exists and belongs to user
    const agent = await Agent.findOne({
      _id: agentId,
      userId: req.user.id,
    });

    if (!agent) {
      const error: AppError = new Error('Agent not found');
      error.statusCode = 404;
      return next(error);
    }

    const calls = await Call.find({ agentId })
      .populate('candidateId', 'name email phone')
      .sort({ scheduledTime: -1 });

    const statusMap: Record<string, 'scheduled' | 'in_progress' | 'completed' | 'failed'> = {
      initiated: 'in_progress',
      in_progress: 'in_progress',
      completed: 'completed',
      failed: 'failed',
    };

    for (const call of calls) {
      if (call.status === 'in_progress' && call.dinodialCallId !== null) {
        try {
          const dinodialDetails = await dinodialService.getCallDetail(call.dinodialCallId);
          const mappedStatus = statusMap[dinodialDetails.status] || call.status;

          if (call.status !== mappedStatus) {
            call.status = mappedStatus;

            // Fetch recording URL when call completes
            if (mappedStatus === 'completed') {
              try {
                const recordingUrl = await dinodialService.getRecordingUrl(call.dinodialCallId);
                call.recordingUrl = recordingUrl;
                logger.info(`Recording URL fetched for call ${call._id}`);
              } catch (recordingErr) {
                logger.error(`Failed to fetch recording URL for call ${call._id}`);
              }

              // Update analysis from Dinodial details
              if (dinodialDetails.call_details?.callOutcomesData) {
                call.analysis = dinodialDetails.call_details.callOutcomesData;
                logger.info(`Analysis updated for call ${call._id}`);
              }
            }

            await call.save();
            logger.info(`Call ${call._id} status synced from Dinodial: ${mappedStatus}`);
          }
        } catch (err) {
          logger.error(`Failed to sync status for call ${call._id} from Dinodial`);
          // Continue with other calls, don't fail the whole request
        }
      }
    }

    res.status(200).json({
      success: true,
      count: calls.length,
      data: calls,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all calls for a candidate
// @route   GET /api/calls/candidate/:candidateId
// @access  Private
export const getCallsByCandidate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { candidateId } = req.params;

    // Validate candidateId format
    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      const error: AppError = new Error('Invalid candidate ID format');
      error.statusCode = 400;
      return next(error);
    }

    // Verify candidate exists
    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      const error: AppError = new Error('Candidate not found');
      error.statusCode = 404;
      return next(error);
    }

    // If candidate has an agent, verify it belongs to user
    if (candidate.agentId) {
      const agent = await Agent.findOne({
        _id: candidate.agentId,
        userId: req.user.id,
      });

      if (!agent) {
        const error: AppError = new Error('Candidate not found');
        error.statusCode = 404;
        return next(error);
      }
    }

    const calls = await Call.find({ candidateId })
      .populate('agentId', 'name jobDetails.title')
      .sort({ scheduledTime: -1 });

    res.status(200).json({
      success: true,
      count: calls.length,
      data: calls,
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Update call details
// @route   PATCH /api/calls/:id
// @access  Private
export const updateCall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { scheduledTime, recordingUrl } = req.body;

    // Validate call ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: AppError = new Error('Invalid call ID format');
      error.statusCode = 400;
      return next(error);
    }

    const call = await Call.findById(id);

    if (!call) {
      const error: AppError = new Error('Call not found');
      error.statusCode = 404;
      return next(error);
    }

    // Verify agent belongs to user
    const agent = await Agent.findOne({
      _id: call.agentId,
      userId: req.user.id,
    });

    if (!agent) {
      const error: AppError = new Error('Call not found');
      error.statusCode = 404;
      return next(error);
    }

    if (scheduledTime !== undefined) {
      call.scheduledTime = new Date(scheduledTime);
    }
    if (recordingUrl !== undefined) {
      call.recordingUrl = recordingUrl;
    }

    await call.save();

    res.status(200).json({
      success: true,
      data: call,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update call status
// @route   PATCH /api/calls/:id/status
// @access  Private
export const updateCallStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate call ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: AppError = new Error('Invalid call ID format');
      error.statusCode = 400;
      return next(error);
    }

    // Validate status value
    if (!['scheduled', 'in_progress', 'completed'].includes(status)) {
      const error: AppError = new Error('Invalid status. Must be one of: scheduled, in_progress, completed');
      error.statusCode = 400;
      return next(error);
    }

    const call = await Call.findById(id);

    if (!call) {
      const error: AppError = new Error('Call not found');
      error.statusCode = 404;
      return next(error);
    }

    // Verify agent belongs to user
    const agent = await Agent.findOne({
      _id: call.agentId,
      userId: req.user.id,
    });

    if (!agent) {
      const error: AppError = new Error('Call not found');
      error.statusCode = 404;
      return next(error);
    }

    call.status = status;
    await call.save();

    res.status(200).json({
      success: true,
      data: call,
    });
  } catch (error) {
    next(error);
  }
};
