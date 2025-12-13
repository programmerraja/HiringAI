import api from "./api";
import { Call } from "./call.api";

// Response types based on design document
export interface InitiateCallResponse {
  success: boolean;
  data: {
    callId: string;
    dinodialCallId: number;
    status: string;
  };
}

export interface DinodialDetails {
  status: string;
  analysis?: Record<string, unknown>;
  recordingUrl?: string;
  duration?: number;
}

export interface CallDetailsResponse {
  success: boolean;
  data: {
    call: Call;
    candidate: {
      _id: string;
      name: string;
      email: string;
      phone?: string;
    };
    agent: {
      _id: string;
      name: string;
      jobDetails?: { title: string };
    };
    dinodialDetails?: DinodialDetails;
  };
}

export const interviewApi = {
  /**
   * Initiates an AI phone screening interview for a scheduled call
   * Requirements: 1.1
   */
  initiateCall: async (callId: string): Promise<InitiateCallResponse> => {
    const response = await api.post(`/calls/${callId}/initiate`);
    return response.data;
  },

  /**
   * Fetches detailed results of an interview including Dinodial data
   * Requirements: 3.1
   */
  getCallDetails: async (callId: string): Promise<CallDetailsResponse> => {
    const response = await api.get(`/calls/${callId}/details`);
    return response.data;
  },
};
