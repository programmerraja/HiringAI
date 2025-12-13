import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { logger } from '../utils/logger';

// Initialize Google Gemini
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || '',
});

export type Pillar = 'experience' | 'behavioral' | 'role_specific' | 'cultural_fit';

export interface GenerateQuestionsParams {
  pillar: Pillar;
  prompt: string;
  jobTitle: string;
  jobDescription?: string;
}

export interface GenerateQuestionsResult {
  questions: string[];
}

/**
 * Generate interview questions using AI based on pillar and prompt
 * @param params - Parameters including pillar, prompt, and job details
 * @returns Array of generated questions
 */
export const generateQuestions = async (
  params: GenerateQuestionsParams
): Promise<GenerateQuestionsResult> => {
  const { pillar, prompt, jobTitle, jobDescription } = params;

  if (!process.env.GOOGLE_API_KEY) {
    logger.warn('GOOGLE_API_KEY not set, returning empty questions');
    return { questions: [] };
  }

  try {
    const contextInfo = jobDescription
      ? `\n\nJob Title: ${jobTitle}\nJob Description: ${jobDescription}`
      : `\n\nJob Title: ${jobTitle}`;

    const fullPrompt = `${prompt}${contextInfo}

Please generate 5 relevant interview questions based on the above context. The questions should be:
- Clear and specific
- Open-ended to encourage detailed responses
- Appropriate for the "${pillar}" interview pillar
- Relevant to the job role`;

    const response = await generateObject({
      model: google('gemini-1.5-flash'),
      schemaName: 'interviewQuestions',
      schemaDescription: 'Generated interview questions for a specific pillar',
      schema: z.object({
        questions: z.array(z.string()).describe('List of generated interview questions'),
      }),
      prompt: fullPrompt,
    });

    logger.info(`Generated ${response.object.questions.length} questions for pillar: ${pillar}`);

    return {
      questions: response.object.questions,
    };
  } catch (error: any) {
    logger.error(`Question generation failed: ${error.message}`);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
};
