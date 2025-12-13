import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { logger } from '../utils/logger';

// Initialize OpenAI with Azure endpoint (same as question.service.ts)
const openai = createOpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Zod schema for experience entry
const experienceEntrySchema = z.object({
  company: z.string().describe('Company or organization name'),
  role: z.string().describe('Job title or role'),
  duration: z.string().describe('Time period (e.g., "Jan 2020 - Dec 2022")'),
  description: z.string().describe('Description of responsibilities and achievements'),
});

// Zod schema for education entry
const educationEntrySchema = z.object({
  institution: z.string().describe('School, university, or institution name'),
  degree: z.string().describe('Degree type (e.g., "Bachelor of Science")'),
  field: z.string().describe('Field of study or major'),
  graduationDate: z.string().optional().describe('Graduation date or expected graduation'),
});

// Zod schema for parsed resume output
export const parsedResumeSchema = z.object({
  name: z.string().optional().describe('Full name of the candidate'),
  email: z.string().optional().describe('Email address'),
  phone: z.string().optional().describe('Phone number'),
  skills: z.array(z.string()).describe('List of skills, technologies, and competencies'),
  experience: z.array(experienceEntrySchema).describe('Work experience entries'),
  education: z.array(educationEntrySchema).describe('Education entries'),
});

// TypeScript types derived from Zod schemas
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
export type EducationEntry = z.infer<typeof educationEntrySchema>;
export type ParsedResumeData = z.infer<typeof parsedResumeSchema>;

// Full parsed resume including raw text
export interface ParsedResume extends ParsedResumeData {
  rawText: string;
}

/**
 * Parse resume text into structured JSON using OpenAI
 * @param text - Raw text extracted from resume PDF
 * @returns Structured resume data with all fields preserved
 */
export const parseResumeText = async (text: string): Promise<ParsedResume> => {
  if (!process.env.OPENAI_API_KEY) {
    logger.warn('OPENAI_API_KEY not set, returning minimal parsed resume');
    return {
      skills: [],
      experience: [],
      education: [],
      rawText: text,
    };
  }

  try {
    const prompt = `Parse the following resume text and extract structured information. 
Extract ALL personal information exactly as it appears - do not redact or modify any names, emails, or phone numbers.
If a field is not found in the resume, omit it from the response.

Resume text:
${text}`;

    const response = await generateObject({
      model: openai('gpt-4o'),
      schemaName: 'parsedResume',
      schemaDescription: 'Structured resume data extracted from raw text',
      schema: parsedResumeSchema,
      prompt,
    });

    logger.info('Successfully parsed resume text');

    return {
      ...response.object,
      rawText: text,
    };
  } catch (error: any) {
    logger.error(`Resume parsing failed: ${error.message}`);
    throw new Error(`Failed to parse resume: ${error.message}`);
  }
};
