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

export interface QuestionWithMetadata {
  text: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  time: string;
  category: string;
}

export interface GenerateQuestionsResult {
  questions: QuestionWithMetadata[];
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
- Relevant to the job role

For each question, estimate:
- Difficulty: Easy, Medium, or Hard
- Time: Estimated seconds to answer (e.g. "60s", "120s")
- Category: A sub-category tag (e.g. "Technical", "Leadership", "Problem Solving")`;

    const response = await generateObject({
      model: google('models/gemini-flash-latest'),
      schemaName: 'interviewQuestions',
      schemaDescription: 'Generated interview questions with metadata',
      schema: z.object({
        questions: z.array(z.object({
          text: z.string().describe('The interview question text'),
          difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('Estimated difficulty level'),
          time: z.string().describe('Estimated time to answer in seconds (e.g. 60s)'),
          category: z.string().describe('Sub-category or tag for the question')
        })).describe('List of generated interview questions with metadata'),
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
