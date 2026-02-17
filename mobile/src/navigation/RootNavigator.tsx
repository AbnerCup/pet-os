import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';

// Navigators
import { MainTabNavigator } from './MainTabNavigator';
import { AuthStackNavigator } from './AuthNavigator';

// Screens adicionales del Root Stack
import { PetDetailScreen } from '../screens/pets/PetDetailScreen';
import { HealthHubScreen } from '../screens/health/HealthHubScreen';
import { AddPetScreen } from '../screens/pets/AddPetScreen';
import { EditPetScreen } from '../screens/pets/EditPetScreen';
import { AddHealthRecordScreen } from '../screens/health/AddHealthRecordScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/profile/ChangePasswordScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ExpensesScreen } from '../screens/expenses/ExpensesScreen';
import { AddExpenseScreen } from '../screens/expenses/AddExpenseScreen';
import { ActivitiesScreen } from '../screens/activities/ActivitiesScreen';
import { AddActivityScreen } from '../screens/activities/AddActivityScreen';
import { AgendaScreen } from '../screens/pets/AgendaScreen';
import { PetTrackingScreen } from '../screens/location/PetTrackingScreen';
import { DevLogsScreen } from '../screens/profile/DevLogsScreen';

import { RootStackParamList } from './types';

import { View, ActivityIndicator, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5c7a4b" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f5f5f5' },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStackNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />

            {/* Screens modales que se abren desde tabs */}
            <Stack.Group screenOptions={{ presentation: 'modal' }}>
              <Stack.Screen
                name="PetDetail"
                component={PetDetailScreen}
                options={{ title: 'Detalle Mascota' }}
              />
              <Stack.Screen
                name="HealthHub"
                component={HealthHubScreen}
                options={{ title: 'Centro de Salud' }}
              />
              <Stack.Screen
                name="AddPet"
                component={AddPetScreen}
                options={{ title: 'Nueva Mascota' }}
              />
              <Stack.Screen
                name="EditPet"
                component={EditPetScreen}
                options={{ title: 'Editar Mascota' }}
              />
              <Stack.Screen
                name="AddHealthRecord"
                component={AddHealthRecordScreen}
                options={{ title: 'Nuevo Registro' }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: 'Configuración' }}
              />
              <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ title: 'Editar Perfil' }}
              />
              <Stack.Screen
                name="ChangePassword"
                component={ChangePasswordScreen}
                options={{ title: 'Cambiar Contraseña' }}
              />
              <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{ title: 'Notificaciones' }}
              />
              <Stack.Screen
                name="Expenses"
                component={ExpensesScreen}
                options={{ title: 'Gastos' }}
              />
              <Stack.Screen
                name="AddExpense"
                component={AddExpenseScreen}
                options={{ title: 'Nuevo Gasto' }}
              />
              <Stack.Screen
                name="Activities"
                component={ActivitiesScreen}
                options={{ title: 'Actividades' }}
              />
              <Stack.Screen
                name="AddActivity"
                component={AddActivityScreen}
                options={{ title: 'Nueva Actividad' }}
              />
              <Stack.Screen
                name="Agenda"
                component={AgendaScreen}
                options={{ title: 'Agenda' }}
              />
              <Stack.Screen
                name="PetTracking"
                component={PetTrackingScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="DevLogs"
                component={DevLogsScreen}
                options={{ title: 'Logs de Desarrollo' }}
              />
            </Stack.Group>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
