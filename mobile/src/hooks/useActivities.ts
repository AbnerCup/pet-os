import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesApi } from '../api/endpoints';
import { ActivityRecord } from '../types';

export const useActivities = (params?: { petId?: string; type?: string }) => {
    return useQuery({
        queryKey: ['activities', params],
        queryFn: async () => {
            const response = await activitiesApi.getAll(params);
            return response.data.data;
        },
    });
};

export const useAddActivity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<ActivityRecord>) => activitiesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            queryClient.invalidateQueries({ queryKey: ['pets'] });
        },
    });
};
