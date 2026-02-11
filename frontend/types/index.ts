export type Species = 'dog' | 'cat' | 'bird' | 'other';
export type HealthType = 'vaccine' | 'medication' | 'checkup' | 'surgery' | 'deworming';
export type ActivityType = 'walk' | 'play' | 'training' | 'grooming' | 'rest';
export type ExpenseCategory = 'food' | 'health' | 'toys' | 'grooming' | 'accessories' | 'other';
export type ReminderType = 'vaccine' | 'medication' | 'grooming' | 'checkup' | 'custom';
export type Plan = 'FREE' | 'BASIC' | 'FAMILY';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  plan: Plan;
  image?: string;
}

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed?: string;
  birthDate?: string;
  weight?: number;
  photoUrl?: string;
  userId: string;
  createdAt: string;
  healthRecords?: HealthRecord[];
  activities?: Activity[];
  expenses?: Expense[];
}

export interface HealthRecord {
  id: string;
  petId: string;
  type: HealthType;
  title: string;
  date: string;
  nextDate?: string;
  vetName?: string;
  notes?: string;
  status: 'completed' | 'pending' | 'overdue';
  pet?: { name: string };
}

export interface Activity {
  id: string;
  petId: string;
  type: ActivityType;
  duration: number;
  date: string;
  notes?: string;
}

export interface Expense {
  id: string;
  petId: string;
  userId: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  pet?: { name: string; photoUrl?: string };
}

export interface Reminder {
  id: string;
  petId?: string;
  petName?: string;
  title: string;
  type: ReminderType;
  dueDate: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface LocationLog {
  id: string;
  petId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  battery?: number;
  timestamp: string;
}

export interface SafeZone {
  id: string;
  petId: string;
  name: string;
  type: 'circle' | 'polygon';
  centerLat?: number;
  centerLng?: number;
  radius?: number;
  isActive: boolean;
}

export interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  message: string;
  petName?: string;
  timestamp: string;
}

export interface DashboardStats {
  totalPets: number;
  upcomingReminders: number;
  monthlyExpenses: number;
  todayActivities: number;
  alerts: Alert[];
}
