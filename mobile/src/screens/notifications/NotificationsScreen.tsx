import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePets } from '../../hooks/usePets';
import { useAllLocations } from '../../hooks/useLocation';

const TABS = [
    { id: 'all', label: 'Todas' },
    { id: 'battery', label: 'Batería' },
    { id: 'health', label: 'Salud' },
    { id: 'system', label: 'Sistema' },
];

const NotificationItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={[
        styles.itemContainer,
        item.urgent && styles.urgentItem
    ]}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon} size={24} color={item.color} />
        </View>
        <View style={styles.contentContainer}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.time}>{item.time}</Text>
            </View>
            <Text style={styles.message}>{item.message}</Text>
        </View>
        {item.urgent && (
            <View style={styles.urgentDot} />
        )}
    </TouchableOpacity>
);

export const NotificationsScreen = () => {
    const navigation = useNavigation();
    const { data: pets } = usePets();
    const { data: locations } = useAllLocations();
    const [activeTab, setActiveTab] = useState('all');

    const notifications = useMemo(() => {
        const list: any[] = [];

        // 1. Alertas de Batería (Alta Prioridad)
        if (locations && Array.isArray(locations)) {
            locations.forEach((item: any) => {
                if (item.location && item.location.battery !== undefined && item.location.battery < 20) {
                    list.push({
                        id: `batt-${item.pet.id}`,
                        title: 'Batería Crítica',
                        message: `${item.pet.name} tiene ${item.location.battery}% de batería. Cárgalo pronto.`,
                        time: 'Bd',
                        icon: 'battery-dead',
                        color: '#e74c3c',
                        urgent: true,
                        dateObj: new Date(),
                        category: 'battery'
                    });
                } else if (item.location && item.location.battery < 50) {
                    list.push({
                        id: `batt-mid-${item.pet.id}`,
                        title: 'Batería Baja',
                        message: `${item.pet.name} tiene ${item.location.battery}% de batería.`,
                        time: 'Hace poco',
                        icon: 'battery-half',
                        color: '#f5a623',
                        urgent: false,
                        dateObj: new Date(),
                        category: 'battery'
                    });
                }
            });
        }

        // 2. Alertas de Salud
        if (pets && Array.isArray(pets)) {
            pets.forEach((pet: any) => {
                if (pet.healthRecords) {
                    pet.healthRecords.forEach((record: any) => {
                        if (record.status === 'pending') {
                            const date = record.nextDate ? new Date(record.nextDate) : new Date(record.date);
                            const now = new Date();
                            const isOverdue = date < now;

                            list.push({
                                id: `health-${record.id}`,
                                title: record.type === 'vaccine' ? 'Vacuna Pendiente' : 'Cita Médica',
                                message: `${pet.name}: ${record.notes || 'Revisión necesaria'}`,
                                time: date.toLocaleDateString(),
                                icon: 'medical',
                                color: isOverdue ? '#e74c3c' : '#f5a623',
                                urgent: isOverdue,
                                dateObj: date,
                                category: 'health'
                            });
                        }
                    });
                }
            });
        }

        // 3. Sistema / Bienvenida
        list.push({
            id: 'sys-welcome',
            title: 'Bienvenido a PetOS',
            message: 'Aquí recibirás notificaciones importantes sobre tus mascotas.',
            time: 'Hoy',
            icon: 'information-circle',
            color: '#4a90e2', // Azul
            urgent: false,
            dateObj: new Date(0),
            category: 'system'
        });

        // Ordenar: Urgentes primero
        return list.sort((a, b) => {
            if (a.urgent && !b.urgent) return -1;
            if (!a.urgent && b.urgent) return 1;
            return 0;
        });

    }, [pets, locations]);

    const filteredNotifications = useMemo(() => {
        if (activeTab === 'all') return notifications;
        return notifications.filter(n => n.category === activeTab);
    }, [notifications, activeTab]);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notificaciones</Text>
                <TouchableOpacity>
                    <Ionicons name="checkmark-done-circle" size={24} color="#7c9a6b" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <FlatList
                    data={TABS}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => {
                        const isActive = activeTab === item.id;
                        return (
                            <TouchableOpacity
                                onPress={() => setActiveTab(item.id)}
                                style={[styles.tab, isActive && styles.activeTab]}
                            >
                                <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        )
                    }}
                    contentContainerStyle={styles.tabsList}
                />
            </View>

            {/* List */}
            <FlatList
                data={filteredNotifications}
                renderItem={({ item }) => <NotificationItem item={item} />}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>No hay notificaciones</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333'
    },
    backButton: {
        padding: 4
    },
    tabsContainer: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 12
    },
    tabsList: {
        paddingHorizontal: 16,
        gap: 12
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        marginRight: 8
    },
    activeTab: {
        backgroundColor: '#7c9a6b',
    },
    tabText: {
        color: '#666',
        fontWeight: '600',
        fontSize: 14
    },
    activeTabText: {
        color: '#fff'
    },
    listContent: {
        padding: 16,
        gap: 12,
    },
    itemContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    urgentItem: {
        borderLeftWidth: 4,
        borderLeftColor: '#e74c3c'
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
    message: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    urgentDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#e74c3c',
        position: 'absolute',
        top: 16,
        right: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        color: '#999',
        fontSize: 16
    }
});
