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
  // Official Government Identity Flow (OTP)
  requestOfficialOTP: (email: string, deviceId?: string) =>
    apiRequest<{ message: string; identifier_masked: string; expires_in_seconds: number; cooldown_seconds: number; provider: string }>(
      '/auth/official/request-otp',
      {
        method: 'POST',
        body: JSON.stringify({ email, device_id: deviceId }),
      }
    ),

  verifyOfficialOTP: (email: string, otp: string, deviceId?: string) =>
    apiRequest<any>('/auth/official/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp, device_id: deviceId }),
    }),

  // Citizen Identity Flow (OTP)
  requestCitizenOTP: (identifier: string, provider: string = 'email_otp') =>
    apiRequest<{ message: string; identifier_masked: string; expires_in_seconds: number; cooldown_seconds: number; provider: string }>(
      '/auth/citizen/request-otp',
      {
        method: 'POST',
        body: JSON.stringify({
          ...(identifier.includes('@') ? { email: identifier } : { mobile_number: identifier }),
          provider,
        }),
      }
    ),

  verifyCitizenOTP: (identifier: string, otp: string, provider: string = 'email_otp', deviceId?: string) =>
    apiRequest<any>('/auth/citizen/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, otp, provider, device_id: deviceId }),
    }),

  // Shared Session Security
  getMe: () => apiRequest<any>('/auth/me'),

  refreshToken: (refreshToken: string) =>
    apiRequest<any>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  logout: (refreshToken?: string) =>
    apiRequest<{ message: string; success: boolean }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken || localStorage.getItem('nlams_refresh_token') }),
    }),

  // Legacy compatibility helpers
  loginCitizen: (mobileNumber: string, otp: string = '123456') =>
    apiRequest<any>('/auth/login/citizen', {
      method: 'POST',
      body: JSON.stringify({
        mobile_number: mobileNumber,
        otp: otp,
      }),
    }),

  loginOfficial: (empIdOrEmail: string, password?: string, otp?: string) =>
    apiRequest<any>('/auth/login/official', {
      method: 'POST',
      body: JSON.stringify({
        ...(empIdOrEmail.includes('@') ? { email: empIdOrEmail } : { emp_id: empIdOrEmail }),
        password: password || 'Password@123',
        otp: otp || '123456',
      }),
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

// -----------------------------------------------------------------------------
// Legal & Statutory RAG Copilot API Client
// -----------------------------------------------------------------------------
export interface RagChunkSource {
  chunk_id: string;
  text: string;
  document_id?: string;
  filename?: string;
  page?: number;
  title?: string;
  type?: string;
  jurisdiction?: string;
  state?: string;
  authority?: string;
  distance?: number;
}

export interface RagQueryResponse {
  query: string;
  answer: string;
  sources: RagChunkSource[];
  total_retrieved: number;
  authorized_chunks_count: number;
  access_decision: string;
  audit_event_id?: string;
}

export interface RagDocumentInfo {
  document_id: string;
  filename: string;
  title?: string;
  type?: string;
  jurisdiction?: string;
  state?: string;
  sector?: string;
  domain?: string;
  authority?: string;
  effective_date?: string;
}

export const ragApi = {
  query: (query: string, top_k: number = 5, documentId?: string, domain?: string, proposalId?: string) =>
    apiRequest<RagQueryResponse>('/rag/query', {
      method: 'POST',
      body: JSON.stringify({
        query,
        top_k,
        document_id: documentId,
        domain,
        proposal_id: proposalId,
      }),
    }),

  retrieve: (query: string, top_k: number = 5, documentId?: string) =>
    apiRequest<RagChunkSource[]>('/rag/retrieve', {
      method: 'POST',
      body: JSON.stringify({
        query,
        top_k,
        document_id: documentId,
      }),
    }),

  listDocuments: () =>
    apiRequest<RagDocumentInfo[]>('/rag/documents'),
};
