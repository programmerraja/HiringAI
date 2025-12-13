
interface AgentData {
    name: string;
    jobDetails: {
        title: string;
        description: string;
    };
    questions: string[];
    persona: "formal" | "casual";
    prompt?: string;
}

function escapeXml(str: string): string {
    if (!str) return "";
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function getPersonaConfig(persona: "formal" | "casual") {
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

export function generatePreviewPrompt(agent: AgentData): string {
    // If agent has a custom XML prompt override, return it directly
    if (agent.prompt && agent.prompt.trim().startsWith('<?xml')) {
        return agent.prompt;
    }

    const personaConfig = getPersonaConfig(agent.persona);

    // Mock candidate for preview
    const candidate = {
        name: "[Candidate Name]",
    };

    const questionsXml = agent.questions
        .map((q, i) => `      <question order="${i + 1}">${escapeXml(q)}</question>`)
        .join('\n');

    // Inject custom instructions if they exist (and aren't XML override)
    const customInstructions = agent.prompt
        ? `\n    <custom_instructions>\n      ${escapeXml(agent.prompt)}\n    </custom_instructions>`
        : '';

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ai_master_prompt>
  <metadata>
    <agent_name>${escapeXml(agent.name)}</agent_name>
    <job_title>${escapeXml(agent.jobDetails.title)}</job_title>
    <job_description>${escapeXml(agent.jobDetails.description)}</job_description>
    <candidate_name>${escapeXml(candidate.name)}</candidate_name>
  </metadata>

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
