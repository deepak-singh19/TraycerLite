import axios from 'axios';
import { PlanResponse, PlanStatusResponse, ExecuteRequest, ExecuteResponse, TaskAnalysis } from '../types';

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Add request interceptor to include API key if available
api.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem('openai_api_key');
  if (apiKey) {
    config.headers['X-OpenAI-API-Key'] = apiKey;
  }
  return config;
});

export const planApi = {
  // Analyze a task and get technology recommendations
  analyzeTask: async (task: string): Promise<TaskAnalysis> => {
    const response = await api.post<TaskAnalysis>('/analyze', { task });
    return response.data;
  },

  // Generate a new plan
  generatePlan: async (task: string): Promise<PlanResponse> => {
    const response = await api.post<PlanResponse>('/plan', { task });
    return response.data;
  },

  // Get plan status
  getPlanStatus: async (taskHash: string): Promise<PlanStatusResponse> => {
    const response = await api.get<PlanStatusResponse>(`/plan-status?taskHash=${taskHash}`);
    return response.data;
  },

  // Execute a phase
  executePhase: async (step: ExecuteRequest['step']): Promise<ExecuteResponse> => {
    const response = await api.post<ExecuteResponse>('/execute', { step });
    return response.data;
  },

  // Get enhancement statistics
  getStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  },
};

export default api;
