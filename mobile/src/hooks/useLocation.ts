import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationApi } from '../api/endpoints';

export const useLocation = (petId: string) => {
  return useQuery({
    queryKey: ['location', petId],
    queryFn: async () => {
      const response = await locationApi.getCurrent(petId);
      const locations = response.data?.data || response.data;
      // Retorna el primer registro (más reciente) o null
      if (Array.isArray(locations) && locations.length > 0) {
        return locations[0];
      }
      return null;
    },
    enabled: !!petId,
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });
};

export const useLocationHistory = (petId: string, limit?: number) => {
  return useQuery({
    queryKey: ['location-history', petId, limit],
    queryFn: async () => {
      const response = await locationApi.getHistory(petId, limit);
      return response.data?.data || response.data || [];
    },
    enabled: !!petId,
  });
};

export const useAllLocations = () => {
  return useQuery({
    queryKey: ['all-locations-latest'],
    queryFn: async () => {
      const response = await locationApi.getLatestAll();
      return response.data?.data || response.data || [];
    },
    refetchInterval: 30000,
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { petId: string; latitude: number; longitude: number; accuracy?: number; battery?: number }) =>
      locationApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['location', variables.petId] });
      queryClient.invalidateQueries({ queryKey: ['location-history', variables.petId] });
      queryClient.invalidateQueries({ queryKey: ['all-locations'] });
    },
  });
};
