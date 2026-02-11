import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationApi } from '../api/endpoints';
import { SafeZone } from '../types';

export const useLocation = (petId: string) => {
  return useQuery({
    queryKey: ['location', petId],
    queryFn: async () => {
      const response = await locationApi.getCurrent(petId);
      return response.data;
    },
    enabled: !!petId,
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });
};

export const useLocationHistory = (petId: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['location-history', petId, startDate, endDate],
    queryFn: async () => {
      const response = await locationApi.getHistory(petId, startDate, endDate);
      return response.data;
    },
    enabled: !!petId,
  });
};

export const useSafeZones = (petId: string) => {
  return useQuery({
    queryKey: ['safe-zones', petId],
    queryFn: async () => {
      const response = await locationApi.getSafeZones(petId);
      return response.data;
    },
    enabled: !!petId,
  });
};

export const useCreateSafeZone = (petId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<SafeZone>) => 
      locationApi.createSafeZone(petId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safe-zones', petId] });
    },
  });
};
