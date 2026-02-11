import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { petsApi } from '../api/endpoints';
import { Pet, HealthRecord } from '../types';

export const usePets = () => {
  return useQuery({
    queryKey: ['pets'],
    queryFn: async () => {
      const response = await petsApi.getAll();
      return response.data;
    },
  });
};

export const usePet = (id: string) => {
  return useQuery({
    queryKey: ['pet', id],
    queryFn: async () => {
      const response = await petsApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreatePet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Pet>) => petsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });
};

export const useHealthRecords = (petId: string) => {
  return useQuery({
    queryKey: ['health-records', petId],
    queryFn: async () => {
      const response = await petsApi.getHealthRecords(petId);
      return response.data;
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
