// Common types used across the application

export interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: any[];
  stack?: string;
}

export interface SuccessResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: UserResponse;
}
