import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Image,
    Alert,
    Platform,
    RefreshControl,
    Animated,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePet } from '../../hooks/usePets';
import { useCreateLocation } from '../../hooks/useLocation';
import { locationApi } from '../../api/endpoints';
import { getPetImage } from '../../utils/helpers';
import * as ExpoLocation from 'expo-location';

export const PetTrackingScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { petId } = route.params;
    const { data: pet, isLoading: isPetLoading } = usePet(petId);
    const createLocationMutation = useCreateLocation();

    const [currentLocation, setCurrentLocation] = useState<any>(null);
    const [locationHistory, setLocationHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

    const fetchData = useCallback(async () => {
        try {
            // Obtener ubicación actual (la más reciente)
            const currentRes = await locationApi.getCurrent(petId);
            const currentData = currentRes.data?.data || currentRes.data;
            if (Array.isArray(currentData) && currentData.length > 0) {
                setCurrentLocation(currentData[0]);
            }

            // Obtener historial
            const historyRes = await locationApi.getHistory(petId, 20);
            const historyData = historyRes.data?.data || historyRes.data;
            if (Array.isArray(historyData)) {
                setLocationHistory(historyData);
            }
        } catch (error) {
            console.error('Error fetching tracking data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [petId]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const onRefresh = async () => {
        setIsRefreshing(true);
        await fetchData();
        setIsRefreshing(false);
    };

    // Registrar ubicación GPS desde el teléfono
    const handleRegisterGPS = async () => {
        setIsUpdating(true);
        try {
            const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permisos necesarios',
                    'Se necesitan permisos de ubicación para registrar la posición de tu mascota.'
                );
                return;
            }

            const loc = await ExpoLocation.getCurrentPositionAsync({
                accuracy: ExpoLocation.Accuracy.High,
            });

            await createLocationMutation.mutateAsync({
                petId,
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                accuracy: loc.coords.accuracy || undefined,
            });

            setCurrentLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                accuracy: loc.coords.accuracy,
                timestamp: new Date().toISOString(),
            });

            Alert.alert('✅ Posición actualizada', `Se registró la ubicación GPS de ${pet?.name}.`);
            await fetchData(); // Recargar historial
        } catch (error: any) {
            console.error('Error registering GPS:', error);
            Alert.alert('Error', error.response?.data?.error || 'No se pudo registrar la ubicación.');
        } finally {
            setIsUpdating(false);
        }
    };

    const formatDate = (timestamp: string) => {
        if (!timestamp) return '';
        const d = new Date(timestamp);
        return d.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (timestamp: string) => {
        if (!timestamp) return '';
        const d = new Date(timestamp);
        return d.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const timeSince = (timestamp: string) => {
        if (!timestamp) return 'Sin datos';
        const now = new Date();
        const then = new Date(timestamp);
        const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
        if (diff < 60) return 'Hace un momento';
        if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
        return `Hace ${Math.floor(diff / 86400)} días`;
    };

    if (isPetLoading || isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#7c9a6b" />
                <Text style={styles.loadingText}>Cargando datos de rastreo...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    tintColor="#7c9a6b"
                    colors={['#7c9a6b']}
                />
            }
        >
            {/* ── Header con info de mascota ── */}
            <View style={styles.headerSection}>
                <View style={styles.headerGradient}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.headerPetInfo}>
                        <Image
                            source={{ uri: getPetImage(pet?.photoUrl, pet?.species) }}
                            style={styles.headerAvatar}
                        />
                        <View style={styles.headerPetText}>
                            <Text style={styles.headerPetName}>{pet?.name}</Text>
                            <Text style={styles.headerPetBreed}>{pet?.breed || pet?.species}</Text>
                        </View>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: currentLocation ? '#34c75930' : '#ff950030' },
                        ]}>
                            <View style={[
                                styles.statusIndicator,
                                { backgroundColor: currentLocation ? '#34c759' : '#ff9500' },
                            ]} />
                            <Text style={[
                                styles.statusText,
                                { color: currentLocation ? '#34c759' : '#ff9500' },
                            ]}>
                                {currentLocation ? 'Localizado' : 'Sin señal'}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* ── Ubicación actual ── */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📍 Ubicación Actual</Text>

                {currentLocation ? (
                    <View style={styles.currentLocationCard}>
                        <View style={styles.coordsBox}>
                            <View style={styles.coordItem}>
                                <Text style={styles.coordLabel}>Latitud</Text>
                                <Text style={styles.coordValue}>
                                    {currentLocation.latitude?.toFixed(6)}
                                </Text>
                            </View>
                            <View style={styles.coordDivider} />
                            <View style={styles.coordItem}>
                                <Text style={styles.coordLabel}>Longitud</Text>
                                <Text style={styles.coordValue}>
                                    {currentLocation.longitude?.toFixed(6)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.metaRow}>
                            <View style={styles.metaItem}>
                                <Ionicons name="time-outline" size={16} color="#999" />
                                <Text style={styles.metaText}>
                                    {timeSince(currentLocation.timestamp)}
                                </Text>
                            </View>
                            {currentLocation.accuracy && (
                                <View style={styles.metaItem}>
                                    <Ionicons name="radio-button-on" size={16} color="#4a90e2" />
                                    <Text style={styles.metaText}>
                                        ±{Math.round(currentLocation.accuracy)}m
                                    </Text>
                                </View>
                            )}
                            {currentLocation.battery != null && (
                                <View style={styles.metaItem}>
                                    <Ionicons
                                        name={currentLocation.battery > 20 ? "battery-half" : "battery-dead"}
                                        size={16}
                                        color={currentLocation.battery > 20 ? '#34c759' : '#ff3b30'}
                                    />
                                    <Text style={styles.metaText}>
                                        {currentLocation.battery}%
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                ) : (
                    <View style={styles.noDataCard}>
                        <Ionicons name="location-outline" size={40} color="#ddd" />
                        <Text style={styles.noDataTitle}>Sin ubicación registrada</Text>
                        <Text style={styles.noDataText}>
                            Registra la primera ubicación GPS de {pet?.name} usando el botón de abajo.
                        </Text>
                    </View>
                )}
            </View>

            {/* ── Botón para actualizar GPS ── */}
            <View style={styles.gpsButtonContainer}>
                <TouchableOpacity
                    style={[styles.gpsButton, isUpdating && styles.gpsButtonDisabled]}
                    onPress={handleRegisterGPS}
                    disabled={isUpdating}
                >
                    {isUpdating ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Ionicons name="locate" size={22} color="#fff" />
                    )}
                    <Text style={styles.gpsButtonText}>
                        {isUpdating ? 'Obteniendo GPS...' : 'Registrar Ubicación GPS'}
                    </Text>
                </TouchableOpacity>
                <Text style={styles.gpsHint}>
                    Usa el GPS de tu teléfono para registrar la posición actual de {pet?.name}
                </Text>
            </View>

            {/* ── Historial de ubicaciones ── */}
            <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>📋 Historial</Text>
                    <Text style={styles.historyCount}>
                        {locationHistory.length} registros
                    </Text>
                </View>

                {locationHistory.length === 0 ? (
                    <View style={styles.noDataCard}>
                        <Ionicons name="list-outline" size={32} color="#ddd" />
                        <Text style={styles.noDataText}>
                            No hay registros de ubicación aún.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.historyList}>
                        {locationHistory.map((loc, index) => (
                            <View
                                key={loc.id || index}
                                style={[
                                    styles.historyItem,
                                    index === 0 && styles.historyItemFirst,
                                ]}
                            >
                                <View style={styles.historyTimeline}>
                                    <View style={[
                                        styles.timelineDot,
                                        index === 0 && styles.timelineDotActive,
                                    ]} />
                                    {index < locationHistory.length - 1 && (
                                        <View style={styles.timelineLine} />
                                    )}
                                </View>
                                <View style={styles.historyContent}>
                                    <View style={styles.historyHeader}>
                                        <Text style={styles.historyDate}>
                                            {formatDate(loc.timestamp)}
                                        </Text>
                                        <Text style={styles.historyTime}>
                                            {formatTime(loc.timestamp)}
                                        </Text>
                                    </View>
                                    <Text style={styles.historyCoords}>
                                        {loc.latitude?.toFixed(5)}, {loc.longitude?.toFixed(5)}
                                    </Text>
                                    {loc.accuracy && (
                                        <Text style={styles.historyAccuracy}>
                                            Precisión: ±{Math.round(loc.accuracy)}m
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {/* Bottom spacer */}
            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6f8',
    },
    contentContainer: {
        paddingBottom: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f6f8',
    },
    loadingText: {
        marginTop: 12,
        color: '#999',
        fontSize: 14,
    },

    // ── Header ──
    headerSection: {
        marginBottom: 0,
    },
    headerGradient: {
        backgroundColor: '#4a90e2',
        paddingTop: 12,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerPetInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    headerPetText: {
        flex: 1,
        marginLeft: 14,
    },
    headerPetName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerPetBreed: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },

    // ── Section ──
    section: {
        paddingHorizontal: 16,
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 14,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    historyCount: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500',
    },

    // ── Current Location Card ──
    currentLocationCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    coordsBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    coordItem: {
        flex: 1,
        alignItems: 'center',
    },
    coordLabel: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500',
    },
    coordValue: {
        fontSize: 17,
        fontWeight: '700',
        color: '#333',
        marginTop: 4,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    coordDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#eee',
    },
    metaRow: {
        flexDirection: 'row',
        marginTop: 16,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        gap: 20,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 13,
        color: '#999',
    },

    // ── No Data ──
    noDataCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    noDataTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#999',
        marginTop: 12,
    },
    noDataText: {
        fontSize: 13,
        color: '#bbb',
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
    },

    // ── GPS Button ──
    gpsButtonContainer: {
        paddingHorizontal: 16,
        marginTop: 24,
        alignItems: 'center',
    },
    gpsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4a90e2',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 10,
        shadowColor: '#4a90e2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    gpsButtonDisabled: {
        opacity: 0.7,
    },
    gpsButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    gpsHint: {
        fontSize: 12,
        color: '#bbb',
        marginTop: 10,
        textAlign: 'center',
        lineHeight: 18,
    },

    // ── History ──
    historyList: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    historyItem: {
        flexDirection: 'row',
        paddingBottom: 16,
    },
    historyItemFirst: {},
    historyTimeline: {
        alignItems: 'center',
        width: 24,
        marginRight: 12,
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#ddd',
        borderWidth: 2,
        borderColor: '#f0f0f0',
    },
    timelineDotActive: {
        backgroundColor: '#4a90e2',
        borderColor: '#e3f2fd',
    },
    timelineLine: {
        flex: 1,
        width: 2,
        backgroundColor: '#eee',
        marginTop: 4,
    },
    historyContent: {
        flex: 1,
        paddingBottom: 4,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    historyDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    historyTime: {
        fontSize: 12,
        color: '#999',
    },
    historyCoords: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    historyAccuracy: {
        fontSize: 11,
        color: '#bbb',
        marginTop: 2,
    },
});
