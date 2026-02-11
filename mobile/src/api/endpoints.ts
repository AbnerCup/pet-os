import api from './config';
import { Pet, User, HealthRecord, Location, SafeZone, DashboardStats, Alert, AuthResponse } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  register: (data: { email: string; password: string; name: string }) =>
    api.post<AuthResponse>('/auth/register', data),

  me: () => api.get<User>('/auth/me'),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

export const petsApi = {
  getAll: () => api.get<Pet[]>('/pets'),

  getById: (id: string) => api.get<Pet>(`/pets/${id}`),

  create: (data: Partial<Pet>) => api.post<Pet>('/pets', data),

  update: (id: string, data: Partial<Pet>) =>
    api.put<Pet>(`/pets/${id}`, data),

  delete: (id: string) => api.delete(`/pets/${id}`),

  getHealthRecords: (petId: string) =>
    api.get<HealthRecord[]>(`/pets/${petId}/health`),

  addHealthRecord: (petId: string, data: Partial<HealthRecord>) =>
    api.post<HealthRecord>(`/pets/${petId}/health`, data),
};

export const locationApi = {
  getCurrent: (petId: string) =>
    api.get<Location>(`/pets/${petId}/location`),

  getHistory: (petId: string, startDate?: string, endDate?: string) =>
    api.get<Location[]>(`/pets/${petId}/location/history`, {
      params: { startDate, endDate },
    }),

  updateLocation: (petId: string, data: { latitude: number; longitude: number }) =>
    api.post<Location>(`/pets/${petId}/location`, data),

  getSafeZones: (petId: string) =>
    api.get<SafeZone[]>(`/pets/${petId}/safe-zones`),

  createSafeZone: (petId: string, data: Partial<SafeZone>) =>
    api.post<SafeZone>(`/pets/${petId}/safe-zones`, data),
};

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats'),

  getAlerts: () => api.get<Alert[]>('/dashboard/alerts'),

  markAlertAsRead: (alertId: string) =>
    api.patch(`/dashboard/alerts/${alertId}/read`),
};

export const userApi = {
  getProfile: () => api.get<User>('/users/profile'),

  updateProfile: (data: Partial<User>) =>
    api.put<User>('/users/profile', data),

  changePassword: (oldPassword: string, newPassword: string) =>
    api.post('/users/change-password', { oldPassword, newPassword }),
};
