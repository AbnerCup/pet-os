import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { PetsListScreen } from '../screens/pets/PetsListScreen';
import { LocationScreen } from '../screens/location/LocationScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Pets') {
            iconName = focused ? 'paw' : 'paw-outline';
          } else if (route.name === 'Location') {
            iconName = focused ? 'location' : 'location-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#5c7a4b',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          // Altura dinamica basada en los insets del dispositivo
          height: Platform.OS === 'ios' ? 80 : 60 + Math.max(insets.bottom, 8),
          paddingBottom: Platform.OS === 'ios' ? 25 : Math.max(insets.bottom, 8),
          paddingTop: 8,
          backgroundColor: '#ffffff',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: '#e5e5e5',
          // Asegurar que la barra este por encima del contenido
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 2,
        },
        // Configuracion de safe area para evitar solapamiento
        tabBarSafeAreaInsets: {
          bottom: Math.max(insets.bottom, 0),
          top: 0,
          left: 0,
          right: 0,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: '#5c7a4b',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen
        name="Pets"
        component={PetsListScreen}
        options={{ title: 'Mascotas' }}
      />
      <Tab.Screen
        name="Location"
        component={LocationScreen}
        options={{ title: 'Ubicación', headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};
