import { Request, Response, NextFunction } from 'express';
import { Company } from '../models/company.model';
import { AppError } from '../middleware/errorHandler';
import { scrapeWebsite, extractCompanyContext } from '../services/jina.service';

// @desc    Get all companies for current user
// @route   GET /api/companies
// @access  Private
export const getCompanies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companies = await Company.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Private
export const getCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = await Company.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!company) {
      const error: AppError = new Error('Company not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create company with website scraping
// @route   POST /api/companies
// @access  Private
export const createCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, website } = req.body;

    if (!name || !website) {
      const error: AppError = new Error('Name and website are required');
      error.statusCode = 400;
      return next(error);
    }

    // Scrape website using Jina
    let culture = '';
    let context = '';

    try {
      const scraped = await scrapeWebsite(website);
      const extracted = await extractCompanyContext(scraped.content);
      context = extracted.context;
    } catch (scrapeError: any) {
      // Log error but continue - company can be created without scraped content
      console.error('Scraping failed:', scrapeError.message);
    }

    const company = await Company.create({
      userId: req.user.id,
      name,
      website,
      culture,
      context,
    });

    res.status(201).json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private
export const updateCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, website, culture, context } = req.body;

    let company = await Company.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!company) {
      const error: AppError = new Error('Company not found');
      error.statusCode = 404;
      return next(error);
    }

    company.name = name || company.name;
    company.website = website || company.website;
    company.context = context !== undefined ? context : company.context;

    await company.save();

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Re-scrape company website
// @route   POST /api/companies/:id/scrape
// @access  Private
export const rescrapeCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = await Company.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!company) {
      const error: AppError = new Error('Company not found');
      error.statusCode = 404;
      return next(error);
    }

    // Scrape website using Jina
    const scraped = await scrapeWebsite(company.website);
    const extracted = await extractCompanyContext(scraped.content);

    company.context = extracted.context;
    await company.save();

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private
export const deleteCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = await Company.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!company) {
      const error: AppError = new Error('Company not found');
      error.statusCode = 404;
      return next(error);
    }

    await company.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
