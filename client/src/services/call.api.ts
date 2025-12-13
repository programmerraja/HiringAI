import api from "./api";

export type CallStatus = "scheduled" | "in_progress" | "completed" | "failed";

export interface Call {
  _id: string;
  candidateId: string | { _id: string; name: string; email: string; phone?: string };
  agentId: string | { _id: string; name: string; jobDetails?: { title: string } };
  status: CallStatus;
  scheduledTime: string;
  recordingUrl?: string;
  dinodialCallId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCallData {
  candidateId: string;
  agentId: string;
  scheduledTime: string;
}

export interface UpdateCallData {
  scheduledTime?: string;
  recordingUrl?: string;
}

export const callApi = {
  create: async (data: CreateCallData): Promise<Call> => {
    const response = await api.post("/calls", data);
    return response.data.data;
  },

  getByAgent: async (agentId: string): Promise<Call[]> => {
    const response = await api.get(`/calls/agent/${agentId}`);
    return response.data.data;
  },

  getByCandidate: async (candidateId: string): Promise<Call[]> => {
    const response = await api.get(`/calls/candidate/${candidateId}`);
    return response.data.data;
  },

  update: async (id: string, data: UpdateCallData): Promise<Call> => {
    const response = await api.patch(`/calls/${id}`, data);
    return response.data.data;
  },

  updateStatus: async (id: string, status: CallStatus): Promise<Call> => {
    const response = await api.patch(`/calls/${id}/status`, { status });
    return response.data.data;
  },
};
