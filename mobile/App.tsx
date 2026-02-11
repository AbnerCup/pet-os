import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

function AppContent() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, []);

  return <RootNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider>
          <AppContent />
          <StatusBar style="auto" />
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
