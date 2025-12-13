import { Request, Response, NextFunction } from 'express';
import { Candidate } from '../models/candidate.model';
import { Agent } from '../models/agent.model';
import { Call } from '../models/call.model';
import { AppError } from '../middleware/errorHandler';
import { parseResumeText } from '../services/resume.service';

// @desc    Get all candidates (optionally filter by agentId)
// @route   GET /api/candidates
// @access  Private
export const getCandidates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { agentId, status } = req.query;

    // Get all agents for current user to filter candidates
    const userAgents = await Agent.find({ userId: req.user.id }).select('_id');
    const agentIds = userAgents.map((a) => a._id);

    // Build query - include candidates assigned to user's agents OR unassigned candidates
    const query: any = {
      $or: [
        { agentId: { $in: agentIds } },
        { agentId: null }
      ]
    };

    if (agentId) {
      // Verify agent belongs to user
      if (!agentIds.some((id) => id.toString() === agentId)) {
        const error: AppError = new Error('Agent not found');
        error.statusCode = 404;
        return next(error);
      }
      delete query.$or;
      query.agentId = agentId;
    }

    if (status) {
      query.status = status;
    }

    const candidates = await Candidate.find(query)
      .populate('agentId', 'name jobDetails.title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single candidate
// @route   GET /api/candidates/:id
// @access  Private
export const getCandidate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate(
      'agentId',
      'name jobDetails companyId',
    );

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

    res.status(200).json({
      success: true,
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create candidate
// @route   POST /api/candidates
// @access  Private
export const createCandidate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { agentId, name, email, phone, resume, scheduledTime } = req.body;

    // If agentId is provided, verify agent belongs to user and scheduledTime is required
    if (agentId) {
      const agent = await Agent.findOne({
        _id: agentId,
        userId: req.user.id,
      });

      if (!agent) {
        const error: AppError = new Error('Agent not found');
        error.statusCode = 404;
        return next(error);
      }

      if (!scheduledTime) {
        const error: AppError = new Error('Scheduled time is required when assigning to an agent');
        error.statusCode = 400;
        return next(error);
      }
    }

    const candidate = await Candidate.create({
      agentId: agentId || null,
      name,
      email,
      phone: phone || '',
      resume: resume || null,
    });

    // If agentId is provided, create a Call record
    let call = null;
    if (agentId && scheduledTime) {
      call = await Call.create({
        candidateId: candidate._id,
        agentId: agentId,
        status: 'scheduled',
        scheduledTime: new Date(scheduledTime),
      });
    }

    res.status(201).json({
      success: true,
      data: candidate,
      call,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update candidate
// @route   PUT /api/candidates/:id
// @access  Private
export const updateCandidate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, resume } = req.body;

    const candidate = await Candidate.findById(req.params.id);

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

    candidate.name = name || candidate.name;
    candidate.email = email || candidate.email;
    if (phone !== undefined) candidate.phone = phone;
    if (resume !== undefined) candidate.resume = resume;

    await candidate.save();

    res.status(200).json({
      success: true,
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update candidate status
// @route   PATCH /api/candidates/:id/status
// @access  Private
export const updateCandidateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;

    if (!['pending', 'interviewed', 'advanced', 'rejected', 'on_hold'].includes(status)) {
      const error: AppError = new Error('Invalid status');
      error.statusCode = 400;
      return next(error);
    }

    const candidate = await Candidate.findById(req.params.id);

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

    await candidate.save();

    res.status(200).json({
      success: true,
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete candidate
// @route   DELETE /api/candidates/:id
// @access  Private
export const deleteCandidate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

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

    await candidate.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign candidate to agent
// @route   POST /api/candidates/:id/assign
// @access  Private
export const assignCandidateToAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { agentId, scheduledTime } = req.body;

    if (!agentId) {
      const error: AppError = new Error('Missing required field: agentId');
      error.statusCode = 400;
      return next(error);
    }

    if (!scheduledTime) {
      const error: AppError = new Error('Missing required field: scheduledTime');
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

    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      const error: AppError = new Error('Candidate not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if candidate is already assigned to another agent
    if (candidate.agentId && candidate.agentId.toString() !== agentId) {
      const error: AppError = new Error('Candidate is already assigned to an agent');
      error.statusCode = 409;
      return next(error);
    }

    // Update candidate's agentId
    candidate.agentId = agentId;
    await candidate.save();

    // Auto-create Call record with status "scheduled"
    const call = await Call.create({
      candidateId: candidate._id,
      agentId: agentId,
      status: 'scheduled',
      scheduledTime: new Date(scheduledTime),
    });

    res.status(200).json({
      success: true,
      data: {
        candidate,
        call,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove candidate from agent
// @route   POST /api/candidates/:id/remove
// @access  Private
export const removeCandidateFromAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

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

    // Clear candidate's agentId
    candidate.agentId = null;
    await candidate.save();

    res.status(200).json({
      success: true,
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unassigned candidates
// @route   GET /api/candidates/unassigned
// @access  Private
export const getUnassignedCandidates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidates = await Candidate.find({ agentId: null })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Parse resume text into structured JSON
// @route   POST /api/candidates/parse-resume
// @access  Private
export const parseResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;

    // Validate that text is provided
    if (!text || typeof text !== 'string') {
      const error: AppError = new Error('Resume text is required');
      error.statusCode = 400;
      return next(error);
    }

    // Validate that text is not empty or whitespace only
    if (text.trim().length === 0) {
      const error: AppError = new Error('Resume text is required');
      error.statusCode = 400;
      return next(error);
    }

    // Parse the resume text using the resume service
    const parsedResume = await parseResumeText(text);

    res.status(200).json({
      success: true,
      data: parsedResume,
    });
  } catch (error: any) {
    // Handle specific parsing errors
    if (error.message?.includes('Failed to parse resume')) {
      const appError: AppError = new Error('Failed to parse resume');
      appError.statusCode = 500;
      return next(appError);
    }
    next(error);
  }
};
