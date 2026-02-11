import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '../api/endpoints';
import { Expense } from '../types';
import { useAuth } from './useAuth';

export const useExpenses = (petId?: string) => {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['expenses', user?.id, petId],
        queryFn: async () => {
            const response = await expensesApi.getAll(petId);
            return response.data.data;
        },
        enabled: !!user?.id,
    });
};

export const useAddExpense = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (data: Partial<Expense>) => expensesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['pets', user?.id] }); // Invalidate pets to update dashboard stats
        },
    });
};

export const useDeleteExpense = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (id: string) => expensesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['pets', user?.id] });
        },
    });
};
