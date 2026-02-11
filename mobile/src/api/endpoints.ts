import api from './config';
import { Pet, User, HealthRecord, Expense, ActivityRecord, Location, SafeZone, DashboardStats, Alert, AuthResponse, ApiResponse } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password }),

  register: (data: { email: string; password: string; name: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data),

  me: () => api.get<ApiResponse<User>>('/auth/me'),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<{ token: string }>>('/auth/refresh', { refreshToken }),
};

export const petsApi = {
  getAll: () => api.get<ApiResponse<Pet[]>>('/pets'),

  getById: (id: string) => api.get<ApiResponse<Pet>>(`/pets/${id}`),

  create: (data: Partial<Pet>) => api.post<ApiResponse<Pet>>('/pets', data),

  update: (id: string, data: Partial<Pet>) =>
    api.put<ApiResponse<Pet>>(`/pets/${id}`, data),

  delete: (id: string) => api.delete(`/pets/${id}`),

  getHealthRecords: (petId: string) =>
    api.get<ApiResponse<HealthRecord[]>>(`/pets/${petId}/health`),

  addHealthRecord: (petId: string, data: Partial<HealthRecord>) =>
    api.post<ApiResponse<HealthRecord>>(`/pets/${petId}/health`, data),
};

export const healthApi = {
  list: (params?: { petId?: string; status?: string }) =>
    api.get<ApiResponse<HealthRecord[]>>('/health', { params }),

  update: (id: string, data: Partial<HealthRecord>) =>
    api.put<ApiResponse<HealthRecord>>(`/health/${id}`, data),
};

export const locationApi = {
  // GET /api/location?petId=xxx — obtiene historial (el más reciente es la "ubicación actual")
  getAll: (petId?: string, limit?: number) =>
    api.get<ApiResponse<any[]>>('/location', { params: { petId, limit } }),

  // Obtener la ubicación más reciente de una mascota
  getCurrent: (petId: string) =>
    api.get<ApiResponse<any[]>>('/location', { params: { petId, limit: 1 } }),

  // POST /api/location — registrar nueva ubicación
  create: (data: { petId: string; latitude: number; longitude: number; accuracy?: number; battery?: number }) =>
    api.post<ApiResponse<Location>>('/location', data),

  // GET /api/location/latest — última ubicación de TODAS las mascotas
  getLatestAll: () =>
    api.get<ApiResponse<{ pet: Pet; location: Location | null }[]>>('/location/latest'),

  // POST /api/location/bulk — registrar múltiples
  createBulk: (data: { locations: any[] }) =>
    api.post<ApiResponse<{ count: number }>>('/location/bulk', data),

  // Alias para compatibilidad
  getHistory: (petId: string, limit?: number) =>
    api.get<ApiResponse<any[]>>('/location', { params: { petId, limit: limit || 100 } }),
};

export const expensesApi = {
  getAll: (petId?: string) => api.get<ApiResponse<Expense[]>>('/expenses', { params: { petId } }),
  getById: (id: string) => api.get<ApiResponse<Expense>>(`/expenses/${id}`),
  create: (data: Partial<Expense>) => api.post<ApiResponse<Expense>>('/expenses', data),
  update: (id: string, data: Partial<Expense>) => api.put<ApiResponse<Expense>>(`/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
};

export const activitiesApi = {
  getAll: (params?: { petId?: string; type?: string }) =>
    api.get<ApiResponse<ActivityRecord[]>>('/activities', { params }),
  create: (data: Partial<ActivityRecord>) =>
    api.post<ApiResponse<ActivityRecord>>('/activities', data),
  update: (id: string, data: Partial<ActivityRecord>) =>
    api.put<ApiResponse<ActivityRecord>>(`/activities/${id}`, data),
  delete: (id: string) => api.delete(`/activities/${id}`),
};

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats'),

  getAlerts: () => api.get<Alert[]>('/dashboard/alerts'),

  markAlertAsRead: (alertId: string) =>
    api.patch(`/dashboard/alerts/${alertId}/read`),
};

export const userApi = {
  getProfile: () => api.get<ApiResponse<User>>('/auth/me'),

  updateProfile: (data: Partial<User>) =>
    api.put<ApiResponse<User>>('/auth/me', data),

  changePassword: (oldPassword: string, newPassword: string) =>
    api.post<ApiResponse<void>>('/auth/change-password', { oldPassword, newPassword }),
};

export const uploadApi = {
  image: (formData: FormData) =>
    api.post<ApiResponse<{ imageUrl: string }>>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};
