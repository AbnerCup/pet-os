import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { petsApi } from '../api/endpoints';
import { HealthRecord } from '../types';

export const useHealth = (params?: { petId?: string; status?: string }) => {
    return useQuery({
        queryKey: ['health', params],
        queryFn: async () => {
            // Si tenemos petId, usamos el endpoint específico de mascota, de lo contrario el general
            if (params?.petId) {
                const response = await petsApi.getHealthRecords(params.petId);
                return response.data.data;
            } else {
                // Asumiendo que añadimos petsApi.listHealth o similar, pero usamos el nuevo list de endpoints.ts
                const { healthApi } = require('../api/endpoints');
                const response = await healthApi.list(params);
                return response.data.data;
            }
        },
    });
};

export const useAddHealthRecord = (petId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<HealthRecord>) => petsApi.addHealthRecord(petId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['health'] });
            queryClient.invalidateQueries({ queryKey: ['pets'] });
        },
    });
};
