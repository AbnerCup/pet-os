import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useActivities } from '../../hooks/useActivities';
import { RootStackParamList } from '../../navigation/types';

type ActivitiesRouteProp = RouteProp<RootStackParamList, 'Activities'>;

export const ActivitiesScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<ActivitiesRouteProp>();
    const { petId } = route.params || {};

    const { data: activities, isLoading, refetch } = useActivities({ petId });

    const activityTypes: Record<string, { icon: string; label: string; color: string; bg: string }> = {
        walk: { icon: '🚶', label: 'Paseo', color: '#4a90e2', bg: '#eef6ff' },
        play: { icon: '🎾', label: 'Juego', color: '#5c7a4b', bg: '#f0f5ee' },
        training: { icon: '🎯', label: 'Entrenamiento', color: '#9b59b6', bg: '#f5eef8' },
        exercise: { icon: '💪', label: 'Ejercicio', color: '#e67e22', bg: '#fdf5ee' },
        social: { icon: '🐕', label: 'Socialización', color: '#e91e63', bg: '#fdeef3' },
        other: { icon: '📝', label: 'Otro', color: '#95a5a6', bg: '#f4f6f6' },
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Actividades</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AddActivity', { petId })}>
                    <Ionicons name="add-circle" size={28} color="#5c7a4b" />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#5c7a4b" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {renderHeader()}

            <FlatList
                data={activities}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
                ListHeaderComponent={
                    <View style={styles.welcomeSection}>
                        <Text style={styles.title}>Registro de Actividad</Text>
                        <Text style={styles.subtitle}>Monitorea el ejercicio y diversión de tus mascotas</Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const typeInfo = activityTypes[item.type] || activityTypes.other;
                    return (
                        <View style={styles.activityCard}>
                            <View style={[styles.iconContainer, { backgroundColor: typeInfo.bg }]}>
                                <Text style={styles.typeEmoji}>{typeInfo.icon}</Text>
                            </View>
                            <View style={styles.activityInfo}>
                                <View style={styles.activityHeader}>
                                    <Text style={styles.activityTitle}>
                                        {typeInfo.label} {item.pet?.name ? `• ${item.pet.name}` : ''}
                                    </Text>
                                    <Text style={styles.durationText}>{item.duration} min</Text>
                                </View>
                                {item.notes ? (
                                    <Text style={styles.notesText} numberOfLines={2}>{item.notes}</Text>
                                ) : null}
                                <View style={styles.footerRow}>
                                    <Ionicons name="time-outline" size={12} color="#999" />
                                    <Text style={styles.dateText}>
                                        {format(new Date(item.date), "EEEE d 'de' MMMM", { locale: es })}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="fitness-outline" size={80} color="#ddd" />
                        <Text style={styles.emptyText}>Sin actividades aún</Text>
                        <Text style={styles.emptySubtext}>Comienza registrando un paseo o juego.</Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => navigation.navigate('AddActivity', { petId })}
                        >
                            <Text style={styles.emptyButtonText}>Registrar mi primera actividad</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fcfcfc' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { backgroundColor: '#fff', paddingTop: 50, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
    backButton: { padding: 5 },
    navTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    welcomeSection: { padding: 20, marginBottom: 10 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    subtitle: { fontSize: 14, color: '#666', marginTop: 5 },
    listContent: { paddingBottom: 30 },
    activityCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 12,
        borderRadius: 16,
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    typeEmoji: { fontSize: 24 },
    activityInfo: { flex: 1 },
    activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    activityTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    durationText: { fontSize: 13, fontWeight: '600', color: '#5c7a4b' },
    notesText: { fontSize: 13, color: '#666', marginBottom: 6 },
    footerRow: { flexDirection: 'row', alignItems: 'center' },
    dateText: { fontSize: 11, color: '#999', marginLeft: 4, textTransform: 'capitalize' },
    emptyContainer: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 15 },
    emptySubtext: { fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center' },
    emptyButton: { marginTop: 25, backgroundColor: '#5c7a4b', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 },
    emptyButtonText: { color: '#fff', fontWeight: 'bold' }
});
