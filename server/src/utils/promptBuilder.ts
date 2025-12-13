import { IAgent } from '../models/agent.model';
import { ICandidate } from '../models/candidate.model';
import { EvaluationTool, EvaluationProperty } from '../types/dinodial.types';

/**
 * Escapes special XML characters in a string
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates persona configuration based on agent's persona setting
 */
function getPersonaConfig(persona: 'formal' | 'casual'): {
  identity: string;
  tone: string;
  vocalStyle: string;
} {
  if (persona === 'formal') {
    return {
      identity: 'Professional HR interviewer conducting a structured screening interview',
      tone: 'Professional, courteous, and business-like',
      vocalStyle: 'Clear, measured pace with professional intonation',
    };
  }
  return {
    identity: 'Friendly recruiter having a conversational screening chat',
    tone: 'Warm, approachable, and conversational',
    vocalStyle: 'Natural, relaxed pace with friendly intonation',
  };
}

/**
 * Builds an XML-structured prompt for Dinodial AI interview
 * 
 * @param companyContext - Context about the company
 * @returns XML string for Dinodial prompt
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
export function buildXMLPrompt(agent: IAgent, candidate: ICandidate, companyContext?: string): string {
  // Check for XML override
  if (agent.prompt && agent.prompt.trim().startsWith('<?xml')) {
    // Inject candidate name into the override if possible
    let prompt = agent.prompt.replace('[Candidate Name]', escapeXml(candidate.name));
    if (companyContext) {
      prompt = prompt.replace('[Company Context]', escapeXml(companyContext));
    }
    return prompt;
  }

  const personaConfig = getPersonaConfig(agent.persona);

  const questionsXml = agent.questions
    .map((q, i) => `      <question order="${i + 1}">${escapeXml(q)}</question>`)
    .join('\n');

  // Inject custom instructions if they exist
  const customInstructions = agent.prompt
    ? `\n    <custom_instructions>\n      ${escapeXml(agent.prompt)}\n    </custom_instructions>`
    : '';

  const companyContextXml = companyContext
    ? `\n  <company_context>\n    ${escapeXml(companyContext)}\n  </company_context>`
    : '';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ai_master_prompt>
  <metadata>
    <agent_name>${escapeXml(agent.name)}</agent_name>
    <job_title>${escapeXml(agent.jobDetails.title)}</job_title>
    <job_description>${escapeXml(agent.jobDetails.description)}</job_description>
    <candidate_name>${escapeXml(candidate.name)}</candidate_name>
  </metadata>${companyContextXml}

  <Persona>
    <identity>${escapeXml(personaConfig.identity)}</identity>
    <tone>${escapeXml(personaConfig.tone)}</tone>
    <vocal_style>${escapeXml(personaConfig.vocalStyle)}</vocal_style>
  </Persona>

  <vocal_output_constraints>
    <speech_rate>moderate</speech_rate>
    <clarity>high</clarity>
    <pause_between_questions>brief</pause_between_questions>
  </vocal_output_constraints>

  <interview_flow>
    <introduction>
      Greet the candidate by name and introduce yourself as the AI interviewer for the ${escapeXml(agent.jobDetails.title)} position.
    </introduction>${customInstructions}
    <questions>
${questionsXml}
    </questions>
    <closing>
      Thank the candidate for their time and explain the next steps in the hiring process.
    </closing>
  </interview_flow>
</ai_master_prompt>`;

  return xml;
}


/**
 * Maps pillar names to human-readable descriptions
 */
const PILLAR_DESCRIPTIONS: Record<string, string> = {
  experience: 'Assessment of the candidate\'s relevant work experience and technical background',
  behavioral: 'Evaluation of the candidate\'s behavioral competencies and soft skills',
  role_specific: 'Assessment of skills and knowledge specific to the job role',
  cultural_fit: 'Evaluation of alignment with company culture and values',
};

/**
 * Builds an evaluation tool JSON schema from agent pillars
 * 
 * @param pillars - Array of pillar names to include in evaluation
 * @returns EvaluationTool structure for Dinodial
 * 
 * Requirements: 5.6, 1.5
 */
export function buildEvaluationTool(pillars: string[]): EvaluationTool {
  const properties: Record<string, EvaluationProperty> = {};
  const required: string[] = [];

  // Add a property for each pillar
  for (const pillar of pillars) {
    const propertyName = `${pillar}_score`;
    properties[propertyName] = {
      type: 'INTEGER',
      description: PILLAR_DESCRIPTIONS[pillar] || `Score for ${pillar}`,
      minimum: 1,
      maximum: 10,
    };
    required.push(propertyName);

    // Add notes field for each pillar
    const notesName = `${pillar}_notes`;
    properties[notesName] = {
      type: 'STRING',
      description: `Detailed notes and observations for ${pillar} assessment`,
    };
    required.push(notesName);
  }

  // Add overall recommendation
  properties['overall_recommendation'] = {
    type: 'STRING',
    enum: ['strongly_recommend', 'recommend', 'neutral', 'not_recommend', 'strongly_not_recommend'],
    description: 'Overall hiring recommendation based on the interview',
  };
  required.push('overall_recommendation');

  // Add summary field
  properties['summary'] = {
    type: 'STRING',
    description: 'Brief summary of the interview and candidate performance',
  };
  required.push('summary');

  return {
    name: 'call_outcomes',
    behavior: 'BLOCKING',
    parameters: {
      type: 'OBJECT',
      required,
      properties,
    },
    description: 'Structured evaluation of the candidate interview performance across defined assessment pillars',
  };
}
