// Dinodial API Types

/**
 * Evaluation property for the evaluation tool schema
 */
export interface EvaluationProperty {
  type: 'STRING' | 'ARRAY' | 'NUMBER' | 'INTEGER';
  enum?: string[];
  description: string;
  items?: { type: string };
  maxLength?: string;
  minLength?: string;
  minimum?: number;
  maximum?: number;
}

/**
 * Evaluation tool structure sent to Dinodial
 */
export interface EvaluationTool {
  name: string;
  behavior: 'BLOCKING';
  parameters: {
    type: 'OBJECT';
    required: string[];
    properties: Record<string, EvaluationProperty>;
  };
  description: string;
}

/**
 * Request body for Dinodial make-call endpoint
 */
export interface DinodialMakeCallRequest {
  phone_number?: string;
  prompt: string; // XML string
  evaluation_tool: EvaluationTool;
  vad_engine?: 'CAWL' | 'LOKEN' | 'CAWN' | 'VALDOR' | 'CALGAR' | 'ANCHORITE' | 'POLUX';
}

/**
 * Response from Dinodial make-call endpoint
 */
export interface DinodialCallResponse {
  data: {
    id: number;
    message: string;
  };
  status: 'success' | 'error';
  status_code: number;
  action_code: string;
}


/**
 * Call detail response from Dinodial
 */
export interface DinodialCallDetail {
  id: number;
  status: 'initiated' | 'in_progress' | 'completed' | 'failed';
  analysis?: Record<string, any>;
  recording_url?: string;
  duration?: number;
  created_at: string;
}

/**
 * Response for initiate call from our API
 */
export interface InitiateCallResponse {
  success: boolean;
  data: {
    callId: string;
    dinodialCallId: number;
    status: string;
  };
}

/**
 * Dinodial details included in call details response
 */
export interface DinodialDetails {
  status: string;
  analysis?: Record<string, any>;
  recordingUrl?: string;
  duration?: number;
}
