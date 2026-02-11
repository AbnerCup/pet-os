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
  species: 'dog' | 'cat' | 'bird' | 'other';
  breed?: string;
  birthDate?: string;
  weight?: number;
  color?: string;
  photoUrl?: string;
  microchipId?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthRecord {
  id: string;
  petId: string;
  type: 'vaccine' | 'checkup' | 'medication' | 'surgery' | 'other';
  title: string;
  description?: string;
  date: string;
  nextDueDate?: string;
  veterinarian?: string;
  cost?: number;
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
  refreshToken: string;
}
