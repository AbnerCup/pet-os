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
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as ExpoLocation from 'expo-location';

import { usePets } from '../../hooks/usePets';
import { useAllLocations, useCreateLocation } from '../../hooks/useLocation';
import { locationApi } from '../../api/endpoints';
import { Pet } from '../../types';
import { RootStackParamList } from '../../navigation/types';
import { getPetImage } from '../../utils/helpers';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAP_HEIGHT = SCREEN_HEIGHT * 0.35; // 35% de la pantalla es el mapa

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
                    <Text style={[styles.petCardBreed, { textTransform: 'capitalize' }]}>{pet.species} • {pet.breed}</Text>
                </View>
                <View style={[
                    styles.statusDot,
                    { backgroundColor: location ? '#34c759' : '#ff9500' }
                ]} />
            </View>

            {location ? (
                <View style={styles.locationInfo}>
                    <View style={styles.locationRow}>
                        <Ionicons name="time-outline" size={14} color="#999" />
                        <Text style={styles.timeText}>
                            Actualizado: {timeSince(location.timestamp)}
                        </Text>
                    </View>
                    <View style={styles.locationTags}>
                        {location.battery !== null && (
                            <View style={styles.tag}>
                                <Ionicons
                                    name={location.battery > 20 ? "battery-half" : "battery-dead"}
                                    size={12}
                                    color={location.battery > 20 ? '#34c759' : '#ff3b30'}
                                />
                                <Text style={styles.tagText}>{location.battery}%</Text>
                            </View>
                        )}
                        <View style={styles.tag}>
                            <Ionicons name="navigate-outline" size={12} color="#4a90e2" />
                            <Text style={styles.tagText}>
                                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                            </Text>
                        </View>
                    </View>
                </View>
            ) : (
                <View style={styles.noLocationContainer}>
                    <Text style={styles.noLocationText}>Sin ubicación reciente</Text>
                </View>
            )}

            <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionButtonMain} onPress={onTrack}>
                    <Ionicons name="map" size={16} color="#fff" />
                    <Text style={styles.actionButtonTextMain}>Ver en Mapa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButtonSecondary, isUpdating && styles.disabledBtn]}
                    onPress={onUpdateLocation}
                    disabled={isUpdating}
                >
                    {isUpdating ? (
                        <ActivityIndicator size="small" color="#4a90e2" />
                    ) : (
                        <Ionicons name="locate" size={18} color="#4a90e2" />
                    )}
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

export const LocationScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const mapRef = useRef<MapView>(null);

    // Hooks
    const { data: pets, isLoading: isPetsLoading, refetch: refetchPets } = usePets();
    const { data: latestLocations, isLoading: isLocLoading, refetch: refetchLocations } = useAllLocations();
    const createLocationMutation = useCreateLocation();

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [updatingPetId, setUpdatingPetId] = useState<string | null>(null);

    // Combinar datos: pets + sus ubicaciones
    const petsWithLoc = pets?.map(pet => {
        const locEntry = latestLocations?.find((l: any) => l.pet.id === pet.id);
        return {
            ...pet,
            location: locEntry?.location || null
        };
    }) || [];

    // Auto-zoom mapa al cargar
    useEffect(() => {
        if (latestLocations && latestLocations.length > 0 && mapRef.current) {
            const coords = latestLocations
                .filter((l: any) => l.location)
                .map((l: any) => ({
                    latitude: l.location.latitude,
                    longitude: l.location.longitude
                }));

            if (coords.length > 0) {
                mapRef.current.fitToCoordinates(coords, {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                });
            }
        }
    }, [latestLocations]);

    const onRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([refetchPets(), refetchLocations()]);
        setIsRefreshing(false);
    };

    const handleUpdateLocationGPS = async (petId: string) => {
        setUpdatingPetId(petId);
        try {
            const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Error', 'Se requiere permiso de ubicación.');
                return;
            }
            const location = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.High });
            await createLocationMutation.mutateAsync({
                petId,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy || undefined,
                battery: 100
            });
            Alert.alert('Éxito', 'Ubicación actualizada');
            refetchLocations();
        } catch (error) {
            Alert.alert('Error', 'No se pudo actualizar la ubicación.');
        } finally {
            setUpdatingPetId(null);
        }
    };

    const petsWithSignal = petsWithLoc.filter(p => p.location).length;

    return (
        <View style={styles.container}>
            {/* ── MAPA SUPERIOR ── */}
            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    provider={PROVIDER_DEFAULT}
                    style={styles.map}
                    initialRegion={{
                        latitude: -17.9647,
                        longitude: -67.1060,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    }}
                >
                    {petsWithLoc.map(pet => (
                        pet.location && (
                            <Marker
                                key={pet.id}
                                coordinate={{
                                    latitude: pet.location.latitude,
                                    longitude: pet.location.longitude
                                }}
                                title={pet.name}
                                onPress={() => navigation.navigate('PetTracking', { petId: pet.id })}
                            >
                                <View style={styles.markerContainer}>
                                    <Image
                                        source={{ uri: getPetImage(pet.photoUrl, pet.species) }}
                                        style={styles.markerImage}
                                    />
                                    <View style={styles.markerBadge} />
                                </View>
                            </Marker>
                        )
                    ))}
                </MapView>

                {/* Overlay Header sobre Mapa */}
                <View style={styles.mapHeaderOverlay}>
                    <TouchableOpacity style={styles.refreshBtnMap} onPress={onRefresh}>
                        <Ionicons name="refresh" size={20} color="#333" />
                    </TouchableOpacity>
                    <View style={styles.mapBadge}>
                        <Text style={styles.mapBadgeText}>{petsWithSignal} en línea</Text>
                    </View>
                </View>
            </View>

            {/* ── LISTA INFERIOR ── */}
            <View style={styles.listContainer}>
                <View style={styles.handleBar} />
                <Text style={styles.listTitle}>Mis Mascotas</Text>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
                >
                    {isPetsLoading ? (
                        <ActivityIndicator color="#5c7a4b" style={{ marginTop: 20 }} />
                    ) : (
                        petsWithLoc.map(pet => (
                            <PetLocationCard
                                key={pet.id}
                                pet={pet}
                                location={pet.location}
                                onTrack={() => navigation.navigate('PetTracking', { petId: pet.id })}
                                onUpdateLocation={() => handleUpdateLocationGPS(pet.id)}
                                isUpdating={updatingPetId === pet.id}
                            />
                        ))
                    )}
                    <View style={{ height: 40 }} />
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
    mapContainer: {
        height: MAP_HEIGHT,
        width: '100%',
        position: 'relative',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    mapHeaderOverlay: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 40,
        right: 20,
        flexDirection: 'row',
        gap: 10,
    },
    refreshBtnMap: {
        width: 36,
        height: 36,
        backgroundColor: '#fff',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    mapBadge: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 12,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    mapBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4a90e2',
    },

    // Marker
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 3,
        borderColor: '#fff',
        backgroundColor: '#eee',
    },
    markerBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#34c759',
        borderWidth: 2,
        borderColor: '#fff',
    },

    // Lista Inferior
    listContainer: {
        flex: 1,
        backgroundColor: '#f5f6f8',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -20,
        overflow: 'hidden',
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: '#ddd',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    listTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    scrollContent: {
        paddingBottom: 20,
    },

    // Cards
    petLocationCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    petCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    petAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#eee',
    },
    petCardInfo: {
        flex: 1,
        marginLeft: 12,
    },
    petCardName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    petCardBreed: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    locationInfo: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 12,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    timeText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    locationTags: {
        flexDirection: 'row',
        gap: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
        borderWidth: 1,
        borderColor: '#eee',
    },
    tagText: {
        fontSize: 11,
        color: '#666',
    },
    noLocationContainer: {
        padding: 12,
        alignItems: 'center',
        backgroundColor: '#fafafa',
        borderRadius: 12,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    noLocationText: {
        fontSize: 12,
        color: '#aaa',
        fontStyle: 'italic',
    },
    cardActions: {
        flexDirection: 'row',
        marginTop: 14,
        gap: 10,
    },
    actionButtonMain: {
        flex: 1,
        backgroundColor: '#4a90e2',
        borderRadius: 12,
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#4a90e2',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    actionButtonTextMain: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
    actionButtonSecondary: {
        width: 44,
        height: 40,
        backgroundColor: '#e3f2fd',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#badaf5',
    },
    disabledBtn: {
        opacity: 0.5,
    },
});
