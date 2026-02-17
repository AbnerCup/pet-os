import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Pet, HealthRecord } from '../types';

// Root Stack Param List
export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  PetDetail: { petId: string };
  HealthHub: { petId?: string; petName?: string };
  AddPet: undefined;
  EditPet: { petId: string };
  AddHealthRecord: { petId: string };
  Settings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Notifications: undefined;
  Expenses: { petId?: string };
  AddExpense: { petId?: string };
  Activities: { petId?: string };
  AddActivity: { petId?: string };
  Agenda: { petId: string; petName: string };
  PetTracking: { petId: string };
  DevLogs: undefined;
};

// Main Tab Param List
export type MainTabParamList = {
  Dashboard: undefined;
  Pets: undefined;
  Location: undefined;
  Profile: undefined;
};

// Screen Props
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type PetsListScreenProps = BottomTabScreenProps<MainTabParamList, 'Pets'>;
export type LocationScreenProps = BottomTabScreenProps<MainTabParamList, 'Location'>;
export type ProfileScreenProps = BottomTabScreenProps<MainTabParamList, 'Profile'>;
export type DashboardScreenProps = BottomTabScreenProps<MainTabParamList, 'Dashboard'>;

// Nested Stack Param Lists
export type PetsStackParamList = {
  PetsList: undefined;
  PetDetail: { petId: string };
  AddPet: undefined;
  EditPet: { petId: string };
};

export type HealthStackParamList = {
  HealthHub: { petId?: string; petName?: string };
  HealthRecordDetail: { recordId: string };
  AddHealthRecord: { petId: string };
};

// Declaration for global navigation types
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}
