/**
 * Predefined prompt templates for each interview pillar.
 * These prompts are used to generate AI-powered interview questions.
 */

export type PillarType = 'experience' | 'behavioral' | 'role_specific' | 'cultural_fit';

export interface PillarPromptConfig {
  label: string;
  prompt: string;
}

export const PILLAR_PROMPTS: Record<PillarType, PillarPromptConfig> = {
  experience: {
    label: 'Experience',
    prompt: "Generate interview questions to assess the candidate's relevant work experience, past projects, and professional background for the role of {jobTitle}.",
  },
  behavioral: {
    label: 'Behavioral',
    prompt: "Generate behavioral interview questions using the STAR method to evaluate the candidate's soft skills, teamwork, and problem-solving abilities for the role of {jobTitle}.",
  },
  role_specific: {
    label: 'Role Specific',
    prompt: "Generate technical and role-specific interview questions to assess the candidate's skills and knowledge required for the role of {jobTitle}.",
  },
  cultural_fit: {
    label: 'Cultural Fit',
    prompt: "Generate interview questions to evaluate if the candidate aligns with company values, work style, and team dynamics for the role of {jobTitle}.",
  },
};

export const PILLAR_TYPES: PillarType[] = ['experience', 'behavioral', 'role_specific', 'cultural_fit'];

/**
 * Get the prompt for a specific pillar, optionally replacing {jobTitle} placeholder.
 */
export function getPillarPrompt(pillar: PillarType, jobTitle?: string): string {
  const prompt = PILLAR_PROMPTS[pillar].prompt;
  if (jobTitle) {
    return prompt.replace('{jobTitle}', jobTitle);
  }
  return prompt;
}
