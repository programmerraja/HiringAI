
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
      identity: 'Experienced Senior Recruiter conducting a professional yet engaging screening. You represent the company brand.',
      tone: 'Professional but warm, attentive, and encouraging. Avoid robotic neutrality; show genuine interest in their responses.',
      vocalStyle: 'Polished and clear, but with natural pitch variations to sound engaged, not monotone.',
    };
  }
  return {
    identity: 'Enthusiastic Talent Scout having a friendly get-to-know-you chat',
    tone: 'High energy, warm, approachable, and curious. Treat this as a conversation among peers.',
    vocalStyle: 'Dynamic, conversational pace with natural intonation to show active listening.',
  };
}

export function generatePreviewPrompt(agent: AgentData, companyContext?: string): string {
  // If agent has a custom XML prompt override, return it with injected values
  if (agent.prompt && agent.prompt.trim().startsWith('<?xml')) {
    let prompt = agent.prompt;
    if (companyContext) {
      prompt = prompt.replace('[Company Context]', escapeXml(companyContext));
    }
    return prompt;
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
    <candidate_resume>
      <skills>Python, React, Node.js, TypeScript, AWS</skills>
      <experience>
        <job>
          <role>Senior Developer</role>
          <company>Tech Corp</company>
          <duration>2020 - Present</duration>
          <description>Led development of core platform features.</description>
        </job>
      </experience>
      <education>
        <school>
          <degree>BS Computer Science</degree>
          <institution>University of Tech</institution>
          <field>Computer Science</field>
        </school>
      </education>
    </candidate_resume>
  </metadata>${companyContextXml}

  <Persona>
    <identity>${escapeXml(personaConfig.identity)}</identity>
    <tone>${escapeXml(personaConfig.tone)}</tone>
    <vocal_style>${escapeXml(personaConfig.vocalStyle)}</vocal_style>
  </Persona>

  <vocal_output_constraints>
    <speech_rate>natural_conversational</speech_rate>
    <clarity>high</clarity>
    <pause_between_questions>natural</pause_between_questions>
  </vocal_output_constraints>

  <conversation_guidelines>
    <active_listening>
      Do not move effectively to the next question like a checklist. Briefly acknowledge the candidate's answer with phrases like "That's a great example," "I see," or "That sounds challenging" to bridge the conversation naturally.
    </active_listening>
    <clarification>
      If a candidate's answer is too brief or unclear, politely ask a follow-up probing question before moving to the next topic.
    </clarification>
    <flow>
      Maintain a professional narrative arc. Transitions between topics should be smooth, not abrupt.
    </flow>
  </conversation_guidelines>

  <interview_flow>
    <introduction>
      Greet the candidate by name warmly. Introduce yourself and the role. Break the ice to make them feel comfortable before diving into technical questions.
    </introduction>${customInstructions}
    <questions>
${questionsXml}
    </questions>
    <closing>
      Thank the candidate for their time, explain the next steps clearly, and wish them a great day.
    </closing>
  </interview_flow>
</ai_master_prompt>`;

  return xml;
}
