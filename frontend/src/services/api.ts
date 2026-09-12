/**
 * NLAMS Backend API Service Client
 * Connects to the FastAPI backend API endpoints with JWT auth header handling.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export interface ApiError {
  detail?: string | Array<{ msg: string; loc: string[] }>;
  message?: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('nlams_access_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    if (typeof data.detail === 'string') {
      errorMessage = data.detail;
    } else if (Array.isArray(data.detail) && data.detail.length > 0) {
      errorMessage = data.detail.map((err: { msg?: string }) => err.msg || 'Invalid field').join(', ');
    } else if (data.message) {
      errorMessage = data.message;
    }
    throw new Error(errorMessage);
  }

  return data as T;
}

// API Endpoints Mapping
export const authApi = {
  loginCitizen: (mobileNumber: string, otp: string = '123456') =>
    apiRequest<any>('/auth/login/citizen', {
      method: 'POST',
      body: JSON.stringify({
        mobile_number: mobileNumber,
        otp: otp,
      }),
    }),

  loginOfficial: (empId: string, password: string, otp?: string) =>
    apiRequest<any>('/auth/login/official', {
      method: 'POST',
      body: JSON.stringify({
        emp_id: empId,
        password: password,
        otp: otp || '123456',
      }),
    }),

  getMe: () => apiRequest<any>('/auth/me'),

  refreshToken: (refreshToken: string) =>
    apiRequest<any>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),
};

// src/services/api.ts - add citizen dashboard endpoints
export interface Project {
  id: number;
  name: string;
  status: string;
  location: { lat: number; lng: number };
  // add other fields as needed
}

export const citizenApi = {
  fetchCitizenProjects: (page: number = 1, pageSize: number = 20) =>
    apiRequest<{ items: Project[]; total: number }>(`/citizen/projects?page=${page}&size=${pageSize}`),
  fetchProjectLocation: (projectId: number) =>
    apiRequest<{ lat: number; lng: number }>(`/citizen/projects/${projectId}/location`),
};
