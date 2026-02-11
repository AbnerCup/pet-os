import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { petsApi } from '../api/endpoints';
import { Pet, HealthRecord } from '../types';
import { useAuth } from './useAuth';

export const usePets = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pets', user?.id],
    queryFn: async () => {
      const response = await petsApi.getAll();
      return response.data.data;
    },
    enabled: !!user?.id,
  });
};

export const usePet = (id: string) => {
  return useQuery({
    queryKey: ['pet', id],
    queryFn: async () => {
      const response = await petsApi.getById(id);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreatePet = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: Partial<Pet>) => petsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets', user?.id] });
    },
  });
};

export const useDeletePet = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (id: string) => petsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets', user?.id] });
    },
  });
};

export const useHealthRecords = (petId: string) => {
  return useQuery({
    queryKey: ['health-records', petId],
    queryFn: async () => {
      const response = await petsApi.getHealthRecords(petId);
      return response.data.data;
    },
    enabled: !!petId,
  });
};

export const useAddHealthRecord = (petId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<HealthRecord>) =>
      petsApi.addHealthRecord(petId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-records', petId] });
    },
  });
};
