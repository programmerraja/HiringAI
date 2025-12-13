import { Request, Response, NextFunction } from 'express';
import { Agent } from '../models/agent.model';
import { Company } from '../models/company.model';
import { AppError } from '../middleware/errorHandler';

// @desc    Get all agents for current user
// @route   GET /api/agents
// @access  Private
export const getAgents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agents = await Agent.find({ userId: req.user.id })
      .populate('companyId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: agents.length,
      data: agents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single agent
// @route   GET /api/agents/:id
// @access  Private
export const getAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agent = await Agent.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).populate('companyId', 'name website culture context');

    if (!agent) {
      const error: AppError = new Error('Agent not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: agent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create agent
// @route   POST /api/agents
// @access  Private
export const createAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId, name, jobDetails, pillars, questions, prompt, persona } = req.body;

    // Verify company belongs to user
    const company = await Company.findOne({
      _id: companyId,
      userId: req.user.id,
    });

    if (!company) {
      const error: AppError = new Error('Company not found');
      error.statusCode = 404;
      return next(error);
    }

    const agent = await Agent.create({
      userId: req.user.id,
      companyId,
      name,
      jobDetails,
      pillars: pillars || [],
      questions: questions || [],
      prompt: prompt || '',
      persona: persona || 'formal',
      status: 'draft',
    });

    res.status(201).json({
      success: true,
      data: agent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update agent
// @route   PUT /api/agents/:id
// @access  Private
export const updateAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, jobDetails, pillars, questions, prompt, persona } = req.body;

    let agent = await Agent.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!agent) {
      const error: AppError = new Error('Agent not found');
      error.statusCode = 404;
      return next(error);
    }

    agent.name = name || agent.name;
    if (jobDetails) {
      agent.jobDetails = {
        title: jobDetails.title || agent.jobDetails.title,
        description: jobDetails.description !== undefined ? jobDetails.description : agent.jobDetails.description,
      };
    }
    if (pillars !== undefined) agent.pillars = pillars;
    if (questions !== undefined) agent.questions = questions;
    if (prompt !== undefined) agent.prompt = prompt;
    if (persona) agent.persona = persona;

    await agent.save();

    res.status(200).json({
      success: true,
      data: agent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update agent status
// @route   PATCH /api/agents/:id/status
// @access  Private
export const updateAgentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;

    if (!['draft', 'active', 'paused', 'archived'].includes(status)) {
      const error: AppError = new Error('Invalid status');
      error.statusCode = 400;
      return next(error);
    }

    const agent = await Agent.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!agent) {
      const error: AppError = new Error('Agent not found');
      error.statusCode = 404;
      return next(error);
    }

    agent.status = status;
    await agent.save();

    res.status(200).json({
      success: true,
      data: agent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete agent
// @route   DELETE /api/agents/:id
// @access  Private
export const deleteAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agent = await Agent.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!agent) {
      const error: AppError = new Error('Agent not found');
      error.statusCode = 404;
      return next(error);
    }

    await agent.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
