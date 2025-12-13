import api from "./api";

export interface Candidate {
  _id: string;
  agentId: string | { _id: string; name: string; jobDetails?: { title: string } };
  name: string;
  email: string;
  phone: string;
  resume: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCandidateData {
  agentId: string;
  name: string;
  email: string;
  phone?: string;
  resume?: string;
}

export interface UpdateCandidateData {
  name?: string;
  email?: string;
  phone?: string;
  resume?: string;
}

export const candidateApi = {
  getAll: async (agentId?: string): Promise<Candidate[]> => {
    const params = new URLSearchParams();
    if (agentId) params.append("agentId", agentId);
    const response = await api.get(`/candidates?${params.toString()}`);
    return response.data.data;
  },

  getById: async (id: string): Promise<Candidate> => {
    const response = await api.get(`/candidates/${id}`);
    return response.data.data;
  },

  create: async (data: CreateCandidateData): Promise<Candidate> => {
    const response = await api.post("/candidates", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateCandidateData): Promise<Candidate> => {
    const response = await api.put(`/candidates/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/candidates/${id}`);
  },
};
