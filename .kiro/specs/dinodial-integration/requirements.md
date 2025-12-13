# Requirements Document

## Introduction

This document specifies the requirements for integrating the Dinodial Proxy API into the HiringAI platform. The integration enables AI-driven phone screening interviews, allowing recruiters to manually initiate automated calls to candidates, retrieve call statuses via polling, access recordings, and view AI-generated analysis/scorecards. All communication with the external Dinodial API is proxied through the Express backend to secure credentials and handle CORS.

## Glossary

- **Dinodial API**: External third-party API service that handles AI-driven phone calls and provides call analysis
- **HiringAI Platform**: The existing recruitment application consisting of a React client and Express server
- **Interview**: An AI-driven phone screening call initiated to a candidate
- **Scorecard**: The processed evaluation output showing candidate assessment across defined pillars
- **Pillars**: Assessment categories for evaluating candidates (e.g., experience, behavioral, role_specific, cultural_fit)
- **Prompt**: The XML-structured instructions sent to Dinodial defining how the AI should conduct the interview
- **Evaluation Tool**: JSON schema sent to Dinodial defining the structure for call outcome evaluation
- **Backend Proxy**: Architecture pattern where the server acts as intermediary between client and external API
- **dinodialCallId**: The numeric ID returned by Dinodial when a call is initiated (e.g., 21)

## Requirements

### Requirement 1

**User Story:** As a recruiter, I want to manually initiate an AI phone screening interview for a scheduled candidate, so that I can automate the initial screening process.

#### Acceptance Criteria

1. WHEN a recruiter clicks the "Start Interview" button for a scheduled call THEN the System SHALL send a call request to the Dinodial API with the candidate's phone number and generated prompt
2. WHEN the Dinodial API returns a successful response THEN the System SHALL store the returned `dinodialCallId` in the Call record and update status to "in_progress"
3. WHEN the Dinodial API is unavailable or returns an error THEN the System SHALL return an appropriate error message to the client without exposing internal API details
4. WHEN initiating a call THEN the System SHALL construct an XML-structured prompt combining the agent's name, job details, questions, persona, and pillars
5. WHEN initiating a call THEN the System SHALL include an evaluation_tool JSON schema defining the interview outcome structure based on the agent's pillars

### Requirement 2

**User Story:** As a recruiter, I want to view a list of all interviews I've initiated, so that I can track the status of candidate screenings.

#### Acceptance Criteria

1. WHEN a recruiter requests the interview list THEN the System SHALL return all calls associated with the recruiter's agents
2. WHEN displaying the interview list THEN the System SHALL show candidate name, phone number, scheduled time, status, and creation date
3. WHEN the call status has changed on Dinodial THEN the System SHALL reflect the updated status when the list is refreshed

### Requirement 3

**User Story:** As a recruiter, I want to view detailed results of a completed interview, so that I can evaluate the candidate's performance.

#### Acceptance Criteria

1. WHEN a recruiter requests interview details THEN the System SHALL fetch and return the call metadata, recording URL, and analysis from Dinodial
2. WHEN displaying interview details THEN the System SHALL show the candidate scorecard with pillar-based assessments
3. WHEN a recording is available THEN the System SHALL provide a playable audio URL to the client
4. IF the interview is not yet completed THEN the System SHALL indicate the current status without analysis data

### Requirement 4

**User Story:** As a system administrator, I want API credentials stored securely on the server, so that sensitive tokens are never exposed to the client.

#### Acceptance Criteria

1. THE System SHALL store the DINODIAL_ADMIN_TOKEN and DINODIAL_API_URL in server environment variables
2. THE System SHALL never include Dinodial API credentials in client-side responses or logs
3. WHEN the server makes requests to Dinodial THEN the System SHALL include the admin token in the authorization header

### Requirement 5

**User Story:** As a recruiter, I want the interview prompt to be dynamically generated from my agent configuration, so that each interview is tailored to the specific job role.

#### Acceptance Criteria

1. WHEN generating an interview prompt THEN the System SHALL create an XML document with ai_master_prompt as the root element
2. WHEN generating an interview prompt THEN the System SHALL include metadata section with agent name and job title
3. WHEN generating an interview prompt THEN the System SHALL include a Persona section with identity, tone, and vocal style based on agent's persona setting (formal/casual)
4. WHEN generating an interview prompt THEN the System SHALL include the custom questions defined for the agent in a structured interview flow section
5. WHEN generating an interview prompt THEN the System SHALL include vocal_output_constraints for proper speech synthesis
6. WHEN generating the evaluation_tool THEN the System SHALL create a JSON schema with properties mapped from the agent's pillars array

### Requirement 6

**User Story:** As a recruiter, I want to see updated call statuses through polling, so that I can monitor ongoing interviews efficiently.

#### Acceptance Criteria

1. WHEN viewing the interview dashboard THEN the System SHALL poll for call status updates at a configurable interval (default 30 seconds)
2. WHEN polling for status THEN the System SHALL fetch the latest status from Dinodial using the stored dinodialCallId
3. WHEN displaying call status THEN the System SHALL show one of: scheduled, in_progress, completed, or failed
4. WHEN a user clicks a manual refresh button THEN the System SHALL immediately fetch the latest status from Dinodial

### Requirement 7

**User Story:** As a developer, I want the Dinodial integration to be encapsulated in a service layer, so that the codebase remains maintainable and testable.

#### Acceptance Criteria

1. THE System SHALL implement a dedicated DinodialService class/module for all external API communication
2. THE System SHALL define TypeScript interfaces for all Dinodial request and response structures
3. WHEN the Dinodial API response format changes THEN only the service layer SHALL require modification
4. THE System SHALL implement a PromptBuilder utility to generate XML prompts from agent configuration
5. THE System SHALL implement an EvaluationToolBuilder utility to generate evaluation_tool JSON from agent pillars

### Requirement 8

**User Story:** As a recruiter, I want the Call model to track Dinodial integration data, so that I can link local calls to external Dinodial calls.

#### Acceptance Criteria

1. THE Call model SHALL include a dinodialCallId field to store the numeric ID returned by Dinodial
2. WHEN a call has not been initiated with Dinodial THEN the dinodialCallId field SHALL be null
3. THE System SHALL use the dinodialCallId to fetch call details, status, and recordings from Dinodial
