import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    RefreshControl,
    ActivityIndicator,
    Animated,
    Dimensions,
    Platform,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePets } from '../../hooks/usePets';
import { useAllLocations, useCreateLocation } from '../../hooks/useLocation';
import { locationApi } from '../../api/endpoints';
import { Pet } from '../../types';
import { RootStackParamList } from '../../navigation/types';
import { getPetImage } from '../../utils/helpers';
import * as ExpoLocation from 'expo-location';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ──────────────────────────────────────────────
//  Componente: PetLocationCard
// ──────────────────────────────────────────────
const PetLocationCard = ({
    pet,
    location,
    onTrack,
    onUpdateLocation,
    isUpdating,
}: {
    pet: Pet;
    location: any;
    onTrack: () => void;
    onUpdateLocation: () => void;
    isUpdating: boolean;
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, []);

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

    return (
        <Animated.View style={[styles.petLocationCard, { opacity: fadeAnim }]}>
            <View style={styles.petCardHeader}>
                <Image
                    source={{ uri: getPetImage(pet.photoUrl, pet.species) }}
                    style={styles.petAvatar}
                />
                <View style={styles.petCardInfo}>
                    <Text style={styles.petCardName}>{pet.name}</Text>
                    <Text style={styles.petCardBreed}>{pet.breed || pet.species}</Text>
                </View>
                <View style={[
                    styles.statusDot,
                    { backgroundColor: location ? '#34c759' : '#ff9500' }
                ]} />
            </View>

            {location ? (
                <View style={styles.locationInfo}>
                    <View style={styles.locationRow}>
                        <Ionicons name="location" size={16} color="#4a90e2" />
                        <Text style={styles.coordsText}>
                            {location.latitude?.toFixed(6)}, {location.longitude?.toFixed(6)}
                        </Text>
                    </View>
                    <View style={styles.locationRow}>
                        <Ionicons name="time-outline" size={16} color="#999" />
                        <Text style={styles.timeText}>
                            {timeSince(location.timestamp)}
                        </Text>
                    </View>
                    {location.battery !== null && location.battery !== undefined && (
                        <View style={styles.locationRow}>
                            <Ionicons
                                name={location.battery > 20 ? "battery-half" : "battery-dead"}
                                size={16}
                                color={location.battery > 20 ? '#34c759' : '#ff3b30'}
                            />
                            <Text style={styles.batteryText}>{location.battery}%</Text>
                        </View>
                    )}
                </View>
            ) : (
                <View style={styles.noLocationContainer}>
                    <Ionicons name="location-outline" size={24} color="#ccc" />
                    <Text style={styles.noLocationText}>Sin ubicación registrada</Text>
                </View>
            )}

            <View style={styles.petCardActions}>
                <TouchableOpacity
                    style={styles.trackButton}
                    onPress={onTrack}
                >
                    <Ionicons name="navigate" size={16} color="#fff" />
                    <Text style={styles.trackButtonText}>Rastrear</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.updateButton, isUpdating && styles.disabledBtn]}
                    onPress={onUpdateLocation}
                    disabled={isUpdating}
                >
                    {isUpdating ? (
                        <ActivityIndicator size="small" color="#4a90e2" />
                    ) : (
                        <>
                            <Ionicons name="locate" size={16} color="#4a90e2" />
                            <Text style={styles.updateButtonText}>GPS</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

// ──────────────────────────────────────────────
//  Componente: QuickStatCard
// ──────────────────────────────────────────────
const QuickStatCard = ({
    icon,
    value,
    label,
    color,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    value: string | number;
    label: string;
    color: string;
}) => (
    <View style={styles.quickStatCard}>
        <View style={[styles.quickStatIcon, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.quickStatValue}>{value}</Text>
        <Text style={styles.quickStatLabel}>{label}</Text>
    </View>
);

// ──────────────────────────────────────────────
//  Componente Principal: LocationScreen
// ──────────────────────────────────────────────
export const LocationScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { data: pets, isLoading: isPetsLoading, refetch: refetchPets } = usePets();
    const createLocationMutation = useCreateLocation();

    const [petLocations, setPetLocations] = useState<Record<string, any>>({});
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [updatingPetId, setUpdatingPetId] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    // ── Cargar ubicaciones de todas las mascotas ──
    const fetchAllLocations = useCallback(async () => {
        if (!pets || pets.length === 0) return;

        try {
            const locMap: Record<string, any> = {};

            for (const pet of pets) {
                try {
                    const res = await locationApi.getCurrent(pet.id);
                    const data = res.data?.data || res.data;
                    if (Array.isArray(data) && data.length > 0) {
                        locMap[pet.id] = data[0];
                    }
                } catch {
                    // Sin ubicación para esta mascota
                }
            }

            setPetLocations(locMap);
            setLastRefresh(new Date());
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    }, [pets]);

    useEffect(() => {
        fetchAllLocations();
        const interval = setInterval(fetchAllLocations, 60000);
        return () => clearInterval(interval);
    }, [fetchAllLocations]);

    const onRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([refetchPets(), fetchAllLocations()]);
        setIsRefreshing(false);
    };

    // ── Registrar ubicación GPS del teléfono para una mascota ──
    const handleUpdateLocationGPS = async (petId: string) => {
        setUpdatingPetId(petId);
        try {
            const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permisos necesarios',
                    'Se necesitan permisos de ubicación para registrar la posición de tu mascota.',
                    [{ text: 'OK' }]
                );
                return;
            }

            const location = await ExpoLocation.getCurrentPositionAsync({
                accuracy: ExpoLocation.Accuracy.High,
            });

            await createLocationMutation.mutateAsync({
                petId,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy || undefined,
            });

            // Actualizar localmente
            setPetLocations(prev => ({
                ...prev,
                [petId]: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    accuracy: location.coords.accuracy,
                    timestamp: new Date().toISOString(),
                },
            }));

            Alert.alert('✅ Ubicación registrada', 'La posición GPS se ha guardado correctamente.');
        } catch (error: any) {
            console.error('Error updating GPS location:', error);
            Alert.alert('Error', error.response?.data?.error || 'No se pudo registrar la ubicación. Verifica tu conexión y permisos.');
        } finally {
            setUpdatingPetId(null);
        }
    };

    // ── Estadísticas rápidas ──
    const petsWithLocation = Object.keys(petLocations).length;
    const totalPets = pets?.length || 0;
    const recentLocations = Object.values(petLocations).filter((loc: any) => {
        if (!loc?.timestamp) return false;
        const diff = Date.now() - new Date(loc.timestamp).getTime();
        return diff < 3600000; // Última hora
    }).length;

    // ── Loading ──
    if (isPetsLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#7c9a6b" />
                <Text style={styles.loadingText}>Cargando mascotas...</Text>
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
            {/* ── Header con gradiente visual ── */}
            <View style={styles.headerSection}>
                <View style={styles.headerGradient}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerTop}>
                            <View>
                                <Text style={styles.headerTitle}>📍 Ubicación</Text>
                                <Text style={styles.headerSubtitle}>
                                    Rastreo GPS de tus mascotas
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.refreshButton}
                                onPress={onRefresh}
                            >
                                <Ionicons name="refresh" size={22} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* Última actualización */}
                        <View style={styles.lastUpdateRow}>
                            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
                            <Text style={styles.lastUpdateText}>
                                Última actualización: {lastRefresh.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* ── Stats rápidas ── */}
            <View style={styles.statsRow}>
                <QuickStatCard
                    icon="paw"
                    value={totalPets}
                    label="Mascotas"
                    color="#7c9a6b"
                />
                <QuickStatCard
                    icon="location"
                    value={petsWithLocation}
                    label="Localizadas"
                    color="#4a90e2"
                />
                <QuickStatCard
                    icon="radio-button-on"
                    value={recentLocations}
                    label="En línea"
                    color="#34c759"
                />
            </View>

            {/* ── Lista de mascotas con ubicación ── */}
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Mis Mascotas</Text>
                    <Text style={styles.sectionBadge}>
                        {petsWithLocation}/{totalPets} con GPS
                    </Text>
                </View>

                {(!pets || pets.length === 0) ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="paw-outline" size={56} color="#ddd" />
                        <Text style={styles.emptyTitle}>Sin mascotas registradas</Text>
                        <Text style={styles.emptySubtext}>
                            Agrega una mascota para comenzar el rastreo GPS
                        </Text>
                        <TouchableOpacity
                            style={styles.addPetButton}
                            onPress={() => navigation.navigate('AddPet')}
                        >
                            <Ionicons name="add" size={20} color="#fff" />
                            <Text style={styles.addPetButtonText}>Agregar Mascota</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    pets.map((pet: Pet) => (
                        <PetLocationCard
                            key={pet.id}
                            pet={pet}
                            location={petLocations[pet.id]}
                            onTrack={() => navigation.navigate('PetTracking', { petId: pet.id })}
                            onUpdateLocation={() => handleUpdateLocationGPS(pet.id)}
                            isUpdating={updatingPetId === pet.id}
                        />
                    ))
                )}
            </View>

            {/* ── Sección informativa: Cómo funciona ── */}
            <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>🛰️ ¿Cómo funciona?</Text>
                <View style={styles.infoCard}>
                    <View style={styles.infoStep}>
                        <View style={[styles.stepNumber, { backgroundColor: '#e8f5e9' }]}>
                            <Text style={[styles.stepNumberText, { color: '#7c9a6b' }]}>1</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Registrar ubicación</Text>
                            <Text style={styles.stepDesc}>
                                Pulsa "GPS" en la tarjeta de tu mascota para registrar tu ubicación actual como posición de la mascota.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.stepDivider} />

                    <View style={styles.infoStep}>
                        <View style={[styles.stepNumber, { backgroundColor: '#e3f2fd' }]}>
                            <Text style={[styles.stepNumberText, { color: '#4a90e2' }]}>2</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Rastrear en mapa</Text>
                            <Text style={styles.stepDesc}>
                                Pulsa "Rastrear" para ver la ubicación en el mapa con actualizaciones en tiempo real.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.stepDivider} />

                    <View style={styles.infoStep}>
                        <View style={[styles.stepNumber, { backgroundColor: '#fff3e0' }]}>
                            <Text style={[styles.stepNumberText, { color: '#f5a623' }]}>3</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Historial</Text>
                            <Text style={styles.stepDesc}>
                                Revisa el historial de posiciones para conocer las rutas y movimientos.
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Bottom spacer */}
            <View style={{ height: 30 }} />
        </ScrollView>
    );
};

// ──────────────────────────────────────────────
//  Estilos
// ──────────────────────────────────────────────
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
        backgroundColor: '#7c9a6b',
        paddingTop: 12,
        paddingBottom: 28,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: {
        paddingHorizontal: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    refreshButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lastUpdateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 6,
    },
    lastUpdateText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
    },

    // ── Quick Stats ──
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginTop: -16,
        gap: 10,
    },
    quickStatCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    quickStatIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickStatValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    quickStatLabel: {
        fontSize: 11,
        color: '#999',
        marginTop: 2,
    },

    // ── Section ──
    sectionContainer: {
        paddingHorizontal: 16,
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    sectionBadge: {
        fontSize: 12,
        color: '#7c9a6b',
        fontWeight: '600',
        backgroundColor: '#e8f5e9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },

    // ── Pet Location Card ──
    petLocationCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 18,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    petCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    petAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#eee',
    },
    petCardInfo: {
        flex: 1,
        marginLeft: 14,
    },
    petCardName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#333',
    },
    petCardBreed: {
        fontSize: 13,
        color: '#999',
        marginTop: 2,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },

    // ── Location Info ──
    locationInfo: {
        marginTop: 14,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 12,
        gap: 8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    coordsText: {
        fontSize: 13,
        color: '#555',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    timeText: {
        fontSize: 13,
        color: '#999',
    },
    batteryText: {
        fontSize: 13,
        color: '#666',
    },
    noLocationContainer: {
        marginTop: 14,
        backgroundColor: '#fafafa',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        borderStyle: 'dashed',
    },
    noLocationText: {
        fontSize: 13,
        color: '#bbb',
        marginTop: 6,
    },

    // ── Card Actions ──
    petCardActions: {
        flexDirection: 'row',
        marginTop: 14,
        gap: 10,
    },
    trackButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#7c9a6b',
        borderRadius: 12,
        paddingVertical: 11,
        gap: 6,
        shadowColor: '#7c9a6b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    trackButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    updateButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e3f2fd',
        borderRadius: 12,
        paddingVertical: 11,
        gap: 6,
    },
    updateButtonText: {
        color: '#4a90e2',
        fontWeight: '600',
        fontSize: 14,
    },
    disabledBtn: {
        opacity: 0.6,
    },

    // ── Empty State ──
    emptyState: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 13,
        color: '#bbb',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    addPetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#7c9a6b',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        marginTop: 20,
        gap: 6,
    },
    addPetButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },

    // ── Info Section ──
    infoSection: {
        paddingHorizontal: 16,
        marginTop: 28,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 14,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    infoStep: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    stepNumberText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    stepDesc: {
        fontSize: 13,
        color: '#999',
        marginTop: 4,
        lineHeight: 19,
    },
    stepDivider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 14,
        marginLeft: 46,
    },
});
