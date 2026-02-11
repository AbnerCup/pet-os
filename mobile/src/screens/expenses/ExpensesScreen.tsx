import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useExpenses, useDeleteExpense } from '../../hooks/useExpenses';
import { usePets } from '../../hooks/usePets';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const ExpensesScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const petId = route.params?.petId;

    const { data: expenses, isLoading, refetch } = useExpenses(petId);
    const { data: pets } = usePets();
    const deleteExpenseMutation = useDeleteExpense();

    const getPetName = (pId: string) => {
        return pets?.find(p => p.id === pId)?.name || 'Mascota';
    };

    const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
        switch (category.toLowerCase()) {
            case 'alimentación':
            case 'comida':
                return 'restaurant';
            case 'salud':
            case 'veterinario':
                return 'medical';
            case 'juguetes':
                return 'football';
            case 'higiene':
                return 'water';
            default:
                return 'card';
        }
    };

    const renderExpenseItem = ({ item }: { item: any }) => (
        <View style={styles.expenseItem}>
            <View style={[styles.categoryIcon, { backgroundColor: '#7c9a6b20' }]}>
                <Ionicons name={getCategoryIcon(item.category)} size={24} color="#7c9a6b" />
            </View>

            <View style={styles.expenseInfo}>
                <Text style={styles.expenseCategory}>{item.category}</Text>
                <Text style={styles.expensePet}>{getPetName(item.petId)}</Text>
                <Text style={styles.expenseDate}>
                    {format(new Date(item.date), "d 'de' MMMM", { locale: es })}
                </Text>
            </View>

            <View style={styles.expenseRight}>
                <Text style={styles.expenseAmount}>€{parseFloat(item.amount).toFixed(2)}</Text>
                <TouchableOpacity
                    onPress={() => deleteExpenseMutation.mutate(item.id)}
                    style={styles.deleteButton}
                >
                    <Ionicons name="trash-outline" size={20} color="#ff4d4d" />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#7c9a6b" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={expenses}
                renderItem={renderExpenseItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={refetch} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="receipt-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No hay gastos registrados</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddExpense', { petId })}
            >
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    expenseItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    expenseInfo: {
        flex: 1,
    },
    expenseCategory: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    expensePet: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    expenseDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    expenseRight: {
        alignItems: 'flex-end',
    },
    expenseAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    deleteButton: {
        padding: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
    },
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 24,
        backgroundColor: '#7c9a6b',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});
