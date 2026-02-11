import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import * as ExpoLocation from 'expo-location';

import { usePet } from '../../hooks/usePets';
import { useCreateLocation } from '../../hooks/useLocation';
import { locationApi } from '../../api/endpoints';
import { getPetImage } from '../../utils/helpers';

const { width } = Dimensions.get('window');

export const PetTrackingScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { petId } = route.params;
    const { data: pet, isLoading: isPetLoading } = usePet(petId);
    const createLocationMutation = useCreateLocation();
    const mapRef = useRef<MapView>(null);

    const [currentLocation, setCurrentLocation] = useState<any>(null);
    const [locationHistory, setLocationHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTracking, setIsTracking] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Referencia para el watcher de GPS
    const locationSubscription = useRef<ExpoLocation.LocationSubscription | null>(null);

    const fetchData = useCallback(async () => {
        try {
            // Obtener ubicación actual (la más reciente)
            const currentRes = await locationApi.getCurrent(petId);
            const currentData = currentRes.data?.data || currentRes.data;
            let currentLoc = null;
            if (Array.isArray(currentData) && currentData.length > 0) {
                // @ts-ignore
                const loc = currentData[0];
                setCurrentLocation(loc);

                // Centrar mapa si es la primera carga y no estamos rastreando activamente
                if (!isTracking && loc && mapRef.current) {
                    mapRef.current.animateToRegion({
                        latitude: loc.latitude,
                        longitude: loc.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    }, 1000);
                }
            }

            // Obtener historial
            const historyRes = await locationApi.getHistory(petId, 50);
            const historyData = historyRes.data?.data || historyRes.data;
            if (Array.isArray(historyData)) {
                setLocationHistory(historyData);
            }

        } catch (error) {
            console.error('Error fetching tracking data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [petId, isTracking]);

    // Polling regular si NO estamos en modo tracking activo
    useEffect(() => {
        if (!isTracking) {
            fetchData();
            const interval = setInterval(fetchData, 15000);
            return () => clearInterval(interval);
        }
    }, [fetchData, isTracking]);

    // Función para iniciar/detener el tracking en vivo
    const toggleTracking = async () => {
        if (isTracking) {
            // Detener tracking
            if (locationSubscription.current) {
                locationSubscription.current.remove();
                locationSubscription.current = null;
            }
            setIsTracking(false);
            Alert.alert('Tracking detenido', 'Se ha dejado de compartir tu ubicación como la de la mascota.');
        } else {
            // Iniciar tracking
            try {
                const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permiso denegado', 'Se requiere acceso a la ubicación para el rastreo.');
                    return;
                }

                setIsTracking(true);
                Alert.alert('Tracking iniciado', 'Tu ubicación actual se registrará como la posición de la mascota en tiempo real.');

                locationSubscription.current = await ExpoLocation.watchPositionAsync(
                    {
                        accuracy: ExpoLocation.Accuracy.High,
                        timeInterval: 5000, // Cada 5 segundos
                        distanceInterval: 5, // O cada 5 metros
                    },
                    async (loc) => {
                        try {
                            // 1. Enviar al backend
                            await createLocationMutation.mutateAsync({
                                petId,
                                latitude: loc.coords.latitude,
                                longitude: loc.coords.longitude,
                                accuracy: loc.coords.accuracy || undefined,
                                battery: 100 // Simulamos batería llena del dispositivo
                            });

                            // 2. Actualizar estado local inmediatamente para suavidad
                            const newPoint = {
                                id: 'live-' + Date.now(),
                                latitude: loc.coords.latitude,
                                longitude: loc.coords.longitude,
                                accuracy: loc.coords.accuracy,
                                timestamp: new Date().toISOString(),
                                battery: 100
                            };

                            setCurrentLocation(newPoint);
                            setLocationHistory(prev => [newPoint, ...prev]);

                            // 3. Mover mapa
                            if (mapRef.current) {
                                mapRef.current.animateCamera({
                                    center: {
                                        latitude: loc.coords.latitude,
                                        longitude: loc.coords.longitude,
                                    },
                                    zoom: 17,
                                });
                            }
                        } catch (err) {
                            console.error("Error enviando ubicación:", err);
                        }
                    }
                );
            } catch (err) {
                console.error("Error iniciando watcher:", err);
                setIsTracking(false);
                Alert.alert("Error", "No se pudo iniciar el servicio de ubicación.");
            }
        }
    };

    // Limpieza al salir
    useEffect(() => {
        return () => {
            if (locationSubscription.current) {
                locationSubscription.current.remove();
            }
        };
    }, []);

    const onRefresh = async () => {
        setIsRefreshing(true);
        await fetchData();
        setIsRefreshing(false);
    };

    const formatDate = (timestamp: string) => {
        if (!timestamp) return '';
        const d = new Date(timestamp);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString();
    };

    if (isLoading && !currentLocation) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#7c9a6b" />
                <Text style={styles.loadingText}>Cargando mapa...</Text>
            </View>
        );
    }

    // Coordenadas iniciales (fallback a Oruro, Bolivia si no hay datos)
    const initialRegion = {
        latitude: currentLocation?.latitude || -17.9647,
        longitude: currentLocation?.longitude || -67.1060,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    };

    return (
        <View style={styles.container}>
            {/* ── MAPA ── */}
            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    provider={PROVIDER_DEFAULT}
                    style={styles.map}
                    initialRegion={initialRegion}
                    showsUserLocation={true} // Muestra punto azul del usuario (el teléfono)
                    showsMyLocationButton={false}
                >
                    {/* Historial (Ruta) */}
                    {locationHistory.length > 0 && (
                        <Polyline
                            coordinates={locationHistory.map(l => ({
                                latitude: l.latitude,
                                longitude: l.longitude
                            }))}
                            strokeColor="#4a90e2"
                            strokeWidth={3}
                        />
                    )}

                    {/* Marcador de la Mascota */}
                    {currentLocation && (
                        <Marker
                            coordinate={{
                                latitude: currentLocation.latitude,
                                longitude: currentLocation.longitude
                            }}
                            title={pet?.name}
                            description={`Última vez: ${formatDate(currentLocation.timestamp)}`}
                        >
                            <View style={styles.markerContainer}>
                                <View style={[styles.markerRing, isTracking && styles.markerRingActive]}>
                                    <Image
                                        source={{ uri: getPetImage(pet?.photoUrl, pet?.species) }}
                                        style={styles.markerImage}
                                    />
                                </View>
                                <View style={styles.markerArrow} />
                            </View>
                        </Marker>
                    )}
                </MapView>

                {/* Botón Volver (flotante sobre mapa) */}
                <TouchableOpacity
                    style={styles.backButtonFloat}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>

                {/* Panel de Control Flotante */}
                <View style={styles.controlPanel}>
                    <View style={styles.petInfoRow}>
                        <View>
                            <Text style={styles.panelPetName}>{pet?.name}</Text>
                            <Text style={styles.panelStatus}>
                                {isTracking ? '📡 Rastreando en vivo...' :
                                    currentLocation ? `📍 Última vez: ${formatDate(currentLocation.timestamp)}` : 'Sin datos'}
                            </Text>
                        </View>
                        <View style={[styles.batteryBadge, { backgroundColor: currentLocation ? '#f0f9ff' : '#eee' }]}>
                            {currentLocation?.battery ? (
                                <>
                                    <Ionicons name="battery-half" size={14} color="#4a90e2" />
                                    <Text style={styles.batteryText}>{currentLocation.battery}%</Text>
                                </>
                            ) : (
                                <Text style={styles.batteryText}>--%</Text>
                            )}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.trackButton,
                            isTracking ? styles.trackButtonStop : styles.trackButtonStart
                        ]}
                        onPress={toggleTracking}
                    >
                        <Ionicons
                            name={isTracking ? "stop-circle-outline" : "paper-plane-outline"}
                            size={24}
                            color="#fff"
                        />
                        <Text style={styles.trackButtonText}>
                            {isTracking ? 'DETENER RASTREO' : 'INICIAR RASTREO (GPS)'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── HISTORIAL DEBAJO DEL MAPA ── */}
            <View style={styles.historyContainer}>
                <View style={styles.historyHandle} />
                <Text style={styles.historyTitle}>Historial Reciente</Text>

                <ScrollView
                    style={styles.historyScroll}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                    }
                >
                    {locationHistory.map((loc, i) => (
                        <View key={i} style={styles.historyRow}>
                            <View style={styles.historyIndicator}>
                                <View style={[styles.dot, i === 0 && styles.dotActive]} />
                                {i < locationHistory.length - 1 && <View style={styles.line} />}
                            </View>
                            <View style={styles.historyData}>
                                <Text style={styles.historyTimeText}>{formatDate(loc.timestamp)}</Text>
                                <Text style={styles.historyCoordsText}>
                                    {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
                                    {loc.accuracy ? ` (±${Math.round(loc.accuracy)}m)` : ''}
                                </Text>
                            </View>
                        </View>
                    ))}
                    {locationHistory.length === 0 && (
                        <Text style={styles.emptyText}>No hay historial reciente.</Text>
                    )}
                    <View style={{ height: 20 }} />
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },

    // Mapa
    mapContainer: {
        flex: 0.65, // 65% de la pantalla para el mapa
        position: 'relative',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    backButtonFloat: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 40,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },

    // Marcador Custom
    markerContainer: {
        alignItems: 'center',
    },
    markerRing: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        padding: 2,
        borderWidth: 2,
        borderColor: '#999',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    markerRingActive: {
        borderColor: '#4a90e2',
        borderWidth: 3,
    },
    markerImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#eee',
    },
    markerArrow: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 0,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#999', // Debe coincidir con el borde
        marginTop: -1,
    },

    // Panel Flotante
    controlPanel: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    petInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    panelPetName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    panelStatus: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    batteryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    batteryText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4a90e2',
    },
    trackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    trackButtonStart: {
        backgroundColor: '#4a90e2',
    },
    trackButtonStop: {
        backgroundColor: '#ff3b30',
    },
    trackButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },

    // Historial Inferior
    historyContainer: {
        flex: 0.35, // 35% restante
        backgroundColor: '#f9f9f9',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -20, // Solapamiento visual leve
        paddingTop: 12,
        paddingHorizontal: 20,
    },
    historyHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#ddd',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 12,
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#444',
        marginBottom: 10,
    },
    historyScroll: {
        flex: 1,
    },
    historyRow: {
        flexDirection: 'row',
        marginBottom: 0,
        height: 50,
    },
    historyIndicator: {
        width: 20,
        alignItems: 'center',
        marginRight: 12,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ccc',
        marginTop: 4,
        borderWidth: 1.5,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    dotActive: {
        backgroundColor: '#4a90e2',
        width: 12,
        height: 12,
        borderRadius: 6,
        marginTop: 3,
    },
    line: {
        width: 2,
        flex: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 2,
    },
    historyData: {
        flex: 1,
        justifyContent: 'flex-start',
        marginTop: 0,
    },
    historyTimeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    historyCoordsText: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 14,
        marginTop: 20,
    },
});
