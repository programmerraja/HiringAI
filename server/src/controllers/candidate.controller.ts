import { Request, Response, NextFunction } from 'express';
import { Candidate } from '../models/candidate.model';
import { Agent } from '../models/agent.model';
import { AppError } from '../middleware/errorHandler';

// @desc    Get all candidates (optionally filter by agentId)
// @route   GET /api/candidates
// @access  Private
export const getCandidates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { agentId, status } = req.query;

    // Get all agents for current user to filter candidates
    const userAgents = await Agent.find({ userId: req.user.id }).select('_id');
    const agentIds = userAgents.map((a) => a._id);

    // Build query
    const query: any = { agentId: { $in: agentIds } };

    if (agentId) {
      // Verify agent belongs to user
      if (!agentIds.some((id) => id.toString() === agentId)) {
        const error: AppError = new Error('Agent not found');
        error.statusCode = 404;
        return next(error);
      }
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

    // Verify candidate's agent belongs to user
    const agent = await Agent.findOne({
      _id: candidate.agentId,
      userId: req.user.id,
    });

    if (!agent) {
      const error: AppError = new Error('Candidate not found');
      error.statusCode = 404;
      return next(error);
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
    const { agentId, name, email, phone, resume } = req.body;

    // Verify agent belongs to user
    const agent = await Agent.findOne({
      _id: agentId,
      userId: req.user.id,
    });

    if (!agent) {
      const error: AppError = new Error('Agent not found');
      error.statusCode = 404;
      return next(error);
    }

    const candidate = await Candidate.create({
      agentId,
      name,
      email,
      phone: phone || '',
      resume: resume || '',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: candidate,
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
    const { name, email, phone, resume, recordingUrl, feedback } = req.body;

    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      const error: AppError = new Error('Candidate not found');
      error.statusCode = 404;
      return next(error);
    }

    // Verify candidate's agent belongs to user
    const agent = await Agent.findOne({
      _id: candidate.agentId,
      userId: req.user.id,
    });

    if (!agent) {
      const error: AppError = new Error('Candidate not found');
      error.statusCode = 404;
      return next(error);
    }

    candidate.name = name || candidate.name;
    candidate.email = email || candidate.email;
    if (phone !== undefined) candidate.phone = phone;
    if (resume !== undefined) candidate.resume = resume;
    if (recordingUrl !== undefined) candidate.recordingUrl = recordingUrl;
    if (feedback !== undefined) candidate.feedback = feedback;

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

    // Verify candidate's agent belongs to user
    const agent = await Agent.findOne({
      _id: candidate.agentId,
      userId: req.user.id,
    });

    if (!agent) {
      const error: AppError = new Error('Candidate not found');
      error.statusCode = 404;
      return next(error);
    }

    candidate.status = status;
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

    // Verify candidate's agent belongs to user
    const agent = await Agent.findOne({
      _id: candidate.agentId,
      userId: req.user.id,
    });

    if (!agent) {
      const error: AppError = new Error('Candidate not found');
      error.statusCode = 404;
      return next(error);
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
