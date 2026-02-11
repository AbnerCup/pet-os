export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: 'FREE' | 'BASIC' | 'PREMIUM';
  createdAt: string;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  birthDate?: string;
  weight?: number;
  photoUrl?: string | null;
  ownerId?: string;
  userId?: string;
  expenses?: Expense[];
  healthRecords?: HealthRecord[];
  activities?: ActivityRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface HealthRecord {
  id: string;
  petId: string;
  title: string;
  description?: string;
  date: string;
  nextDate?: string;
  vetName?: string;
  status: 'completed' | 'pending' | 'overdue';
  createdAt: string;
}

export interface Expense {
  id: string;
  petId: string;
  amount: number | string;
  category: string;
  description?: string;
  date: string;
  createdAt: string;
}

export interface ActivityRecord {
  id: string;
  petId: string;
  type: string;
  duration: number;
  date: string;
  notes?: string;
  pet?: { name: string };
  createdAt: string;
}

export interface Location {
  id: string;
  petId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
  batteryLevel?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

export interface RootStackParamList {
  Auth: undefined;
  Main: { screen: string };
  PetDetail: { petId: string };
  HealthHub: { petId: string; petName: string };
  AddPet: undefined;
  EditPet: { petId: string };
  Settings: undefined;
  Notifications: undefined;
}
export interface SafeZone {
  id: string;
  petId: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  enabled: boolean;
}

export interface DashboardStats {
  totalPets: number;
  expenses: string;
  pending: number;
  appointments: number;
}

export interface Alert {
  id: string;
  type: 'health' | 'location' | 'system';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}
