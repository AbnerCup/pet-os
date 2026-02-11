import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useHealth } from '../../hooks/useHealth';
import { RootStackParamList } from '../../navigation/types';

type HealthHubRouteProp = RouteProp<RootStackParamList, 'HealthHub'>;

export const HealthHubScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<HealthHubRouteProp>();
    const { petId, petName } = route.params || {};

    const { data: records, isLoading, refetch } = useHealth({
        petId,
        status: petId ? undefined : 'pending'
    });

    const renderHeader = () => (
        <View style={styles.header}>
            <View>
                <Text style={styles.title}>{petName ? `Salud de ${petName}` : 'Pendientes de Salud'}</Text>
                <Text style={styles.subtitle}>
                    {petName ? 'Historial médico y recordatorios' : 'Todas las vacunas y citas pendientes'}
                </Text>
            </View>
        </View>
    );

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'completed': return { icon: 'checkmark-circle', color: '#7c9a6b', label: 'Completado' };
            case 'overdue': return { icon: 'alert-circle', color: '#e74c3c', label: 'Vencido' };
            default: return { icon: 'time', color: '#f5a623', label: 'Pendiente' };
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#7c9a6b" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Centro de Salud</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
            >
                {renderHeader()}

                {records && records.length > 0 ? (
                    records.map((record: any) => {
                        const info = getStatusInfo(record.status);
                        return (
                            <TouchableOpacity
                                key={record.id}
                                style={styles.recordCard}
                                onPress={() => {/* Ver detalle */ }}
                            >
                                <View style={[styles.statusIndicator, { backgroundColor: info.color }]} />
                                <View style={styles.recordContent}>
                                    <View style={styles.recordHeader}>
                                        <Text style={styles.recordTitle}>{record.title}</Text>
                                        <Text style={[styles.statusText, { color: info.color }]}>{info.label}</Text>
                                    </View>

                                    <View style={styles.recordInfo}>
                                        <Ionicons name="calendar-outline" size={14} color="#666" />
                                        <Text style={styles.recordDate}>
                                            {format(new Date(record.date), "dd 'de' MMMM, yyyy", { locale: es })}
                                        </Text>
                                    </View>

                                    {!petId && record.pet?.name && (
                                        <View style={styles.petTag}>
                                            <Ionicons name="paw" size={12} color="#7c9a6b" />
                                            <Text style={styles.petTagName}>{record.pet.name}</Text>
                                        </View>
                                    )}

                                    {record.description && (
                                        <Text style={styles.description} numberOfLines={2}>
                                            {record.description}
                                        </Text>
                                    )}
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#ccc" />
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="checkmark-done-circle-outline" size={80} color="#7c9a6b" />
                        <Text style={styles.emptyText}>¡Todo al día!</Text>
                        <Text style={styles.emptySubtext}>No hay recordatorios de salud pendientes.</Text>
                    </View>
                )}
            </ScrollView>

            {petId && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('AddHealthRecord', { petId })}
                >
                    <Ionicons name="add" size={30} color="#fff" />
                </TouchableOpacity>
            )}
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
    },
    backButton: { padding: 5 },
    navTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 20 },
    header: { marginBottom: 25 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    subtitle: { fontSize: 14, color: '#666', marginTop: 5 },
    recordCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        marginBottom: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    statusIndicator: {
        width: 4,
        height: '80%',
        borderRadius: 2,
        marginRight: 15,
    },
    recordContent: { flex: 1 },
    recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    recordTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    recordInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    recordDate: { fontSize: 13, color: '#666', marginLeft: 5 },
    description: { fontSize: 13, color: '#888', fontStyle: 'italic' },
    petTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f5ee',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        alignSelf: 'flex-start',
        marginTop: 5,
        marginBottom: 5,
    },
    petTagName: { fontSize: 11, color: '#7c9a6b', fontWeight: 'bold', marginLeft: 4 },
    emptyContainer: { alignItems: 'center', paddingTop: 60 },
    emptyText: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 15 },
    emptySubtext: { fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center' },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#7c9a6b',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
    }
});
