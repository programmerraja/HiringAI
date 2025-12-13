import api from "./api";

export interface Company {
  _id: string;
  userId: string;
  name: string;
  website: string;
  culture: string;
  context: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyData {
  name: string;
  website: string;
}

export interface UpdateCompanyData {
  name?: string;
  website?: string;
  culture?: string;
  context?: string;
}

export const companyApi = {
  getAll: async (): Promise<Company[]> => {
    const response = await api.get("/companies");
    return response.data.data;
  },

  getById: async (id: string): Promise<Company> => {
    const response = await api.get(`/companies/${id}`);
    return response.data.data;
  },

  create: async (data: CreateCompanyData): Promise<Company> => {
    const response = await api.post("/companies", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateCompanyData): Promise<Company> => {
    const response = await api.put(`/companies/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/companies/${id}`);
  },

  rescrape: async (id: string): Promise<Company> => {
    const response = await api.post(`/companies/${id}/scrape`);
    return response.data.data;
  },
};
