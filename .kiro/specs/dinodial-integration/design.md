# Design Document: Dinodial AI Integration

## Overview

This design document outlines the technical implementation for integrating the Dinodial Proxy API into the HiringAI platform. The integration follows a backend proxy pattern where the Express server acts as an intermediary between the React client and the external Dinodial API, ensuring secure credential management and proper CORS handling.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (React)                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │ AgentDetailPage │  │ InterviewList   │  │ InterviewResultsPage        │  │
│  │ "Start Interview"│  │ (polling)       │  │ (scorecard + audio player)  │  │
│  └────────┬────────┘  └────────┬────────┘  └─────────────┬───────────────┘  │
│           │                    │                         │                   │
│           └────────────────────┼─────────────────────────┘                   │
│                                │                                             │
│                    ┌───────────▼───────────┐                                 │
│                    │   interview.api.ts    │                                 │
│                    └───────────┬───────────┘                                 │
└────────────────────────────────┼─────────────────────────────────────────────┘
                                 │ HTTP
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SERVER (Express)                                │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        interview.routes.ts                           │    │
│  │  POST /api/calls/:id/initiate  │  GET /api/calls/:id/details        │    │
│  └──────────────────┬─────────────┴──────────────┬─────────────────────┘    │
│                     │                            │                           │
│  ┌──────────────────▼────────────────────────────▼─────────────────────┐    │
│  │                     interview.controller.ts                          │    │
│  └──────────────────┬────────────────────────────┬─────────────────────┘    │
│                     │                            │                           │
│  ┌──────────────────▼──────────┐  ┌──────────────▼─────────────────────┐    │
│  │      PromptBuilder          │  │        DinodialService             │    │
│  │  - buildXMLPrompt()         │  │  - makeCall()                      │    │
│  │  - buildEvaluationTool()    │  │  - getCallDetail()                 │    │
│  └─────────────────────────────┘  │  - getRecordingUrl()               │    │
│                                   └──────────────┬─────────────────────┘    │
└──────────────────────────────────────────────────┼──────────────────────────┘
                                                   │ HTTP + Bearer Token
                                                   ▼
                                    ┌──────────────────────────────┐
                                    │      Dinodial Proxy API      │
                                    │  POST /api/proxy/make-call/  │
                                    │  GET /api/proxy/call/detail/ │
                                    │  GET /api/proxy/recording-url│
                                    └──────────────────────────────┘
```

## Components and Interfaces

### Server Components

#### 1. DinodialService (`server/src/services/dinodial.service.ts`)

Handles all HTTP communication with the external Dinodial API.

```typescript
interface DinodialService {
  makeCall(phoneNumber: string, prompt: string, evaluationTool: EvaluationTool): Promise<DinodialCallResponse>;
  getCallDetail(dinodialCallId: number): Promise<DinodialCallDetail>;
  getRecordingUrl(dinodialCallId: number): Promise<string>;
}
```

#### 2. PromptBuilder (`server/src/utils/promptBuilder.ts`)

Generates XML prompts and evaluation tools from agent configuration.

```typescript
interface PromptBuilder {
  buildXMLPrompt(agent: IAgent, candidate: ICandidate): string;
  buildEvaluationTool(pillars: string[]): EvaluationTool;
}
```

#### 3. InterviewController (`server/src/controllers/interview.controller.ts`)

Handles business logic for interview operations.

```typescript
interface InterviewController {
  initiateCall(req: Request, res: Response): Promise<void>;
  getCallDetails(req: Request, res: Response): Promise<void>;
}
```

### Client Components

#### 1. Interview API (`client/src/services/interview.api.ts`)

```typescript
interface InterviewApi {
  initiateCall(callId: string): Promise<InitiateCallResponse>;
  getCallDetails(callId: string): Promise<CallDetailsResponse>;
}
```

## Data Models

### Dinodial API Types (`server/src/types/dinodial.types.ts`)

```typescript
// Request to Dinodial make-call endpoint
interface DinodialMakeCallRequest {
  phone_number: string;
  prompt: string;  // XML string
  evaluation_tool: EvaluationTool;
  vad_engine?: 'CAWL' | 'LOKEN' | 'CAWN' | 'VALDOR' | 'CALGAR' | 'ANCHORITE' | 'POLUX';
}

// Response from Dinodial make-call endpoint
interface DinodialCallResponse {
  data: {
    id: number;
    message: string;
  };
  status: 'success' | 'error';
  status_code: number;
  action_code: string;
}

// Evaluation tool structure
interface EvaluationTool {
  name: string;
  behavior: 'BLOCKING';
  parameters: {
    type: 'OBJECT';
    required: string[];
    properties: Record<string, EvaluationProperty>;
  };
  description: string;
}

interface EvaluationProperty {
  type: 'STRING' | 'ARRAY' | 'NUMBER';
  enum?: string[];
  description: string;
  items?: { type: string };
  maxLength?: string;
  minLength?: string;
}

// Call detail response from Dinodial
interface DinodialCallDetail {
  id: number;
  status: 'initiated' | 'in_progress' | 'completed' | 'failed';
  analysis?: Record<string, any>;
  recording_url?: string;
  duration?: number;
  created_at: string;
}
```

### Updated Call Model (`server/src/models/call.model.ts`)

Add new field to existing ICall interface:

```typescript
interface ICall extends Document {
  candidateId: mongoose.Types.ObjectId;
  agentId: mongoose.Types.ObjectId;
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed';
  scheduledTime: Date;
  recordingUrl: string;
  dinodialCallId: number | null;  // NEW FIELD
  createdAt: Date;
  updatedAt: Date;
}
```

### API Response Types

```typescript
// Response for initiate call
interface InitiateCallResponse {
  success: boolean;
  data: {
    callId: string;
    dinodialCallId: number;
    status: string;
  };
}

// Response for call details
interface CallDetailsResponse {
  success: boolean;
  data: {
    call: ICall;
    candidate: ICandidate;
    agent: IAgent;
    dinodialDetails?: {
      status: string;
      analysis?: Record<string, any>;
      recordingUrl?: string;
      duration?: number;
    };
  };
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: XML Prompt Contains All Agent Fields
*For any* valid agent configuration with name, jobDetails, questions, persona, and pillars, the generated XML prompt SHALL contain all of these fields in the appropriate sections.
**Validates: Requirements 1.4, 5.1, 5.2, 5.3, 5.4, 5.5**

### Property 2: Evaluation Tool Maps Pillars to Properties
*For any* array of pillars, the generated evaluation_tool SHALL have a property in the schema for each pillar in the input array.
**Validates: Requirements 1.5, 5.6**

### Property 3: Successful Initiation Updates Call Record
*For any* successful Dinodial API response with an id, the corresponding Call record SHALL have dinodialCallId set to that id and status set to "in_progress".
**Validates: Requirements 1.2**

### Property 4: Error Responses Hide Internal Details
*For any* error response from the server, the response body SHALL NOT contain the DINODIAL_ADMIN_TOKEN or DINODIAL_API_URL values.
**Validates: Requirements 1.3, 4.2**

### Property 5: Authorization Header Included
*For any* request made to the Dinodial API, the request SHALL include an Authorization header with Bearer token format.
**Validates: Requirements 4.3**

### Property 6: Interview List Filters by User's Agents
*For any* user requesting the interview list, the returned calls SHALL only include calls where the agentId belongs to an agent owned by that user.
**Validates: Requirements 2.1**

### Property 7: Call Details Response Structure
*For any* call with a dinodialCallId, when fetching details, the response SHALL include the call metadata and dinodialDetails object with status field.
**Validates: Requirements 3.1, 3.4**

### Property 8: Incomplete Calls Have No Analysis
*For any* call where status is not "completed", the dinodialDetails SHALL NOT include analysis data.
**Validates: Requirements 3.4**

### Property 9: Status Values Are Valid
*For any* call status displayed in the system, the value SHALL be one of: scheduled, in_progress, completed, or failed.
**Validates: Requirements 6.3**

### Property 10: DinodialCallId Used for API Calls
*For any* call to getCallDetail or getRecordingUrl, the dinodialCallId from the Call record SHALL be used as the identifier in the Dinodial API request.
**Validates: Requirements 6.2, 8.3**

## Error Handling

### Dinodial API Errors

| Error Scenario | Handling Strategy |
|----------------|-------------------|
| Network timeout | Return 503 with "External service unavailable" message |
| 401 Unauthorized | Log error, return 500 with generic message (don't expose auth issues) |
| 404 Call not found | Return 404 with "Interview not found" |
| 500 Server error | Return 502 with "External service error" |
| Invalid response format | Log error, return 500 with "Unexpected response format" |

### Validation Errors

| Error Scenario | Handling Strategy |
|----------------|-------------------|
| Call not found | Return 404 |
| Call already initiated (has dinodialCallId) | Return 409 "Interview already initiated" |
| Candidate has no phone number | Return 400 "Candidate phone number required" |
| Agent not active | Return 400 "Agent must be active to initiate calls" |

## Testing Strategy

### Property-Based Testing

We will use **fast-check** library for property-based testing in TypeScript.

Each property-based test MUST:
1. Be tagged with the format: `**Feature: dinodial-integration, Property {number}: {property_text}**`
2. Run a minimum of 100 iterations
3. Reference the correctness property from this design document

### Test Categories

#### 1. PromptBuilder Tests (Property-Based)
- **Property 1**: Generate random agent configurations, verify XML contains all fields
- **Property 2**: Generate random pillar arrays, verify evaluation_tool has matching properties

#### 2. DinodialService Tests (Unit + Mocked)
- **Property 5**: Verify all requests include Authorization header
- **Property 3**: Mock successful response, verify Call record updated
- **Property 4**: Mock error responses, verify no credentials leaked

#### 3. Controller Tests (Integration)
- **Property 6**: Create multiple users with agents, verify filtering
- **Property 7, 8**: Test response structure for various call states
- **Property 9**: Verify status values are always valid
- **Property 10**: Verify correct dinodialCallId used in API calls

### Unit Tests

- DinodialService HTTP client methods
- PromptBuilder XML generation
- EvaluationToolBuilder JSON generation
- Error handling and response mapping

### Integration Tests

- Full flow: initiate call → verify Call record updated
- Full flow: get details → verify response structure
- Authentication middleware integration
