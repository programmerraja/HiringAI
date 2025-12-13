# Requirements Document

## Introduction

This feature enhances the Agent management system by adding a Call schema to track interview calls, AI-powered question generation for interview pillars, and a redesigned Agent detail page with three tabs (Config, Candidates, Calls). Users can create candidates independently, assign them to agents, and automatically generate scheduled call records. The system supports AI-assisted question generation based on predefined prompts for each interview pillar.

## Glossary

- **Agent**: An interview configuration entity containing job details, questions, pillars, and persona settings
- **Candidate**: A person being interviewed, can exist independently and be assigned to an agent
- **Call**: A scheduled interview session linking a candidate to an agent with status tracking
- **Pillar**: Interview question category - one of: experience, behavioral, role_specific, cultural_fit
- **Pillar Prompt**: A predefined prompt template used to generate AI questions for a specific pillar
- **Scheduled Time**: The date and time when an interview call is planned to occur

## Requirements

### Requirement 1

**User Story:** As a user, I want to create and manage call records, so that I can track interview sessions for each candidate.

#### Acceptance Criteria

1. WHEN a candidate is assigned to an agent THEN the System SHALL create a Call record with status "scheduled", the candidate ID, agent ID, and scheduled time
2. WHEN a Call record is created THEN the System SHALL store candidateId, agentId, status, scheduledTime, and recordingUrl fields
3. WHEN a call status changes THEN the System SHALL update the status to one of: "scheduled", "in_progress", or "completed"
4. WHEN retrieving calls for an agent THEN the System SHALL return all Call records associated with that agent ID

### Requirement 2

**User Story:** As a user, I want to generate interview questions using AI, so that I can quickly create relevant questions for each interview pillar.

#### Acceptance Criteria

1. WHEN a user selects a pillar and requests AI-generated questions THEN the System SHALL use the predefined pillar prompt to generate relevant questions via the AI service
2. WHEN AI generates questions THEN the System SHALL display the suggested questions to the user for review
3. WHEN a user edits an AI-generated question THEN the System SHALL update the question text with the user's changes
4. WHEN a user deletes an AI-generated question THEN the System SHALL remove that question from the list
5. WHEN a user manually enters a question THEN the System SHALL add that question to the agent's question list

### Requirement 3

**User Story:** As a user, I want predefined prompts for each interview pillar, so that AI can generate contextually appropriate questions.

#### Acceptance Criteria

1. WHEN the frontend loads the question generation interface THEN the System SHALL provide hardcoded prompt templates for each pillar: experience, behavioral, role_specific, and cultural_fit
2. WHEN a user selects a pillar THEN the System SHALL display the predefined prompt for that pillar
3. WHEN a user modifies a pillar prompt THEN the System SHALL use the modified prompt for AI question generation
4. WHEN a user requests AI questions with a custom prompt THEN the System SHALL send the custom prompt to the AI service

### Requirement 4

**User Story:** As a user, I want to assign candidates to an agent and schedule calls, so that I can organize interviews efficiently.

#### Acceptance Criteria

1. WHEN a user assigns a candidate to an agent THEN the System SHALL update the candidate's agentId field to reference that agent
2. WHEN a user assigns a candidate with a scheduled time THEN the System SHALL create a Call record with the specified scheduledTime
3. WHEN a candidate is already assigned to an agent THEN the System SHALL prevent assignment to a different agent
4. WHEN a user removes a candidate from an agent THEN the System SHALL clear the candidate's agentId and update associated Call records

### Requirement 5

**User Story:** As a user, I want to view the Agent detail page with three tabs, so that I can manage configuration, candidates, and calls separately.

#### Acceptance Criteria

1. WHEN a user opens the Agent detail page THEN the System SHALL display three tabs: Config, Candidates, and Calls
2. WHEN a user selects the Config tab THEN the System SHALL display agent name, job details, pillars, questions, prompt, and persona settings
3. WHEN a user selects the Candidates tab THEN the System SHALL display all candidates assigned to that agent
4. WHEN a user selects the Calls tab THEN the System SHALL display all scheduled calls for that agent with candidate details and scheduled time
5. WHEN a user clicks on a call in the Calls tab THEN the System SHALL allow the user to view call details

### Requirement 6

**User Story:** As a user, I want candidates to exist independently before being assigned to agents, so that I can manage my candidate pool flexibly.

#### Acceptance Criteria

1. WHEN a user creates a candidate THEN the System SHALL create the candidate without requiring an agentId
2. WHEN listing unassigned candidates THEN the System SHALL return candidates where agentId is null or empty
3. WHEN a user views the candidate assignment interface THEN the System SHALL display available unassigned candidates for selection
