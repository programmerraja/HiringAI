import api from "./api";

export interface JobDetails {
  title: string;
  description: string;
}

export interface Agent {
  _id: string;
  userId: string;
  companyId: string | { _id: string; name: string; website?: string; culture?: string; context?: string };
  name: string;
  jobDetails: JobDetails;
  pillars: string[];
  questions: string[];
  prompt: string;
  persona: "formal" | "casual";
  status: "draft" | "active" | "paused" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentData {
  companyId: string;
  name: string;
  jobDetails: JobDetails;
  pillars?: string[];
  questions?: string[];
  prompt?: string;
  persona?: "formal" | "casual";
}

export interface UpdateAgentData {
  name?: string;
  jobDetails?: Partial<JobDetails>;
  pillars?: string[];
  questions?: string[];
  prompt?: string;
  persona?: "formal" | "casual";
}

export type Pillar = "experience" | "behavioral" | "role_specific" | "cultural_fit";

export interface GenerateQuestionsRequest {
  pillar: Pillar;
  prompt: string;
}

export interface GenerateQuestionsResponse {
  questions: string[];
}

export const agentApi = {
  getAll: async (): Promise<Agent[]> => {
    const response = await api.get("/agents");
    return response.data.data;
  },

  getById: async (id: string): Promise<Agent> => {
    const response = await api.get(`/agents/${id}`);
    return response.data.data;
  },

  create: async (data: CreateAgentData): Promise<Agent> => {
    const response = await api.post("/agents", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateAgentData): Promise<Agent> => {
    const response = await api.put(`/agents/${id}`, data);
    return response.data.data;
  },

  updateStatus: async (id: string, status: Agent["status"]): Promise<Agent> => {
    const response = await api.patch(`/agents/${id}/status`, { status });
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/agents/${id}`);
  },

  generateQuestions: async (
    id: string,
    data: GenerateQuestionsRequest
  ): Promise<GenerateQuestionsResponse> => {
    const response = await api.post(`/agents/${id}/generate-questions`, data);
    return response.data.data;
  },
};
