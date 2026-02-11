import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { format, isAfter, isBefore, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { useHealth } from '../../hooks/useHealth';
import { healthApi } from '../../api/endpoints';
import { RootStackParamList } from '../../navigation/types';
import { useQueryClient } from '@tanstack/react-query';

type AgendaRouteProp = RouteProp<RootStackParamList, 'Agenda'>;

export const AgendaScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<AgendaRouteProp>();
    const { petId, petName } = route.params;
    const queryClient = useQueryClient();

    const { data: records, isLoading, refetch } = useHealth({ petId });

    const [isCompleting, setIsCompleting] = useState<string | null>(null);

    const handleComplete = async (recordId: string) => {
        setIsCompleting(recordId);
        try {
            await healthApi.update(recordId, {
                status: 'completed'
            });
            queryClient.invalidateQueries({ queryKey: ['health'] });
            queryClient.invalidateQueries({ queryKey: ['pets'] });
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo marcar como completado');
        } finally {
            setIsCompleting(null);
        }
    };

    const pendingRecords = records?.filter((r: any) => r.status === 'pending') || [];
    const completedRecords = records?.filter((r: any) => r.status === 'completed') || [];

    const getStatusColor = (date: string) => {
        const d = new Date(date);
        if (isBefore(d, new Date()) && !isToday(d)) return '#e74c3c'; // Overdue
        if (isToday(d)) return '#4a90e2'; // Today
        return '#f5a623'; // Upcoming
    };

    return (
        <View style={styles.container}>
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Agenda de {petName}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AddHealthRecord', { petId })}>
                    <Ionicons name="add" size={28} color="#7c9a6b" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
            >
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tareas Pendientes</Text>
                    {pendingRecords.length > 0 ? (
                        pendingRecords.map((record: any) => (
                            <View key={record.id} style={styles.taskCard}>
                                <View style={[styles.dateBadge, { backgroundColor: getStatusColor(record.date) + '15' }]}>
                                    <Text style={[styles.dateText, { color: getStatusColor(record.date) }]}>
                                        {format(new Date(record.date), 'dd/MM')}
                                    </Text>
                                </View>
                                <View style={styles.taskInfo}>
                                    <Text style={styles.taskTitle}>{record.title}</Text>
                                    <Text style={styles.taskType}>{record.type}</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.checkButton}
                                    onPress={() => {
                                        Alert.alert(
                                            'Completar Tarea',
                                            '¿Has completado esta actividad?',
                                            [
                                                { text: 'Cancelar', style: 'cancel' },
                                                { text: 'Sí, completada', onPress: () => handleComplete(record.id) }
                                            ]
                                        );
                                    }}
                                >
                                    <Ionicons name="ellipse-outline" size={28} color="#ccc" />
                                </TouchableOpacity>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>No hay tareas pendientes</Text>
                        </View>
                    )}
                </View>

                {completedRecords.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: '#999' }]}>Completadas Recientemente</Text>
                        {completedRecords.slice(0, 5).map((record: any) => (
                            <View key={record.id} style={[styles.taskCard, { opacity: 0.6 }]}>
                                <View style={styles.taskInfo}>
                                    <Text style={[styles.taskTitle, styles.completedText]}>{record.title}</Text>
                                    <Text style={styles.taskType}>{format(new Date(record.date), 'PP', { locale: es })}</Text>
                                </View>
                                <Ionicons name="checkmark-circle" size={28} color="#7c9a6b" />
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fcfcfc' },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    navTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    content: { padding: 20 },
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    dateBadge: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    dateText: { fontSize: 14, fontWeight: 'bold' },
    taskInfo: { flex: 1 },
    taskTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
    taskType: { fontSize: 12, color: '#999', marginTop: 2 },
    checkButton: { padding: 5 },
    completedText: { textDecorationLine: 'line-through', color: '#999' },
    emptyCard: { padding: 20, alignItems: 'center', backgroundColor: '#f9f9f9', borderRadius: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: '#ddd' },
    emptyText: { color: '#999', fontSize: 14 },
});
