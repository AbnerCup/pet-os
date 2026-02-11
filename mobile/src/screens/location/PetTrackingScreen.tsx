import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePet } from '../../hooks/usePets';
import { locationApi } from '../../api/endpoints';

export const PetTrackingScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { petId } = route.params;
    const { data: pet, isLoading: isPetLoading } = usePet(petId);

    const [location, setLocation] = useState<any>(null);
    const [safeZones, setSafeZones] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Actualizar cada 30s
        return () => clearInterval(interval);
    }, [petId]);

    const fetchData = async () => {
        try {
            const [locRes, szRes] = await Promise.all([
                locationApi.getCurrent(petId),
                locationApi.getSafeZones(petId)
            ]);

            if (locRes.data) setLocation(locRes.data);
            if (szRes.data) setSafeZones(szRes.data);
        } catch (error) {
            console.error('Error fetching tracking data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isPetLoading || isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#7c9a6b" />
            </View>
        );
    }

    // Default to a central point if no location (e.g. Madrid or user's last known)
    // For demo/dev, we can use a mock if loc is null
    const initialRegion = {
        latitude: location?.latitude || -12.046374,
        longitude: location?.longitude || -77.042793,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={initialRegion}
                provider={PROVIDER_GOOGLE}
            >
                {location && (
                    <Marker
                        coordinate={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                        }}
                        title={pet?.name}
                        description="Última ubicación conocida"
                    >
                        <View style={styles.markerContainer}>
                            <Ionicons name="paw" size={24} color="#7c9a6b" />
                        </View>
                    </Marker>
                )}

                {safeZones.map((zone) => (
                    <Circle
                        key={zone.id}
                        center={{
                            latitude: zone.latitude,
                            longitude: zone.longitude,
                        }}
                        radius={zone.radius}
                        fillColor="rgba(124, 154, 107, 0.2)"
                        strokeColor="rgba(124, 154, 107, 0.5)"
                    />
                ))}
            </MapView>

            {/* Floating Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.infoBox}>
                    <Text style={styles.petName}>{pet?.name}</Text>
                    <Text style={styles.status}>
                        {location ? 'En línea' : 'Buscando señal...'}
                    </Text>
                </View>
            </View>

            {/* Bottom Menu / Actions Placeholder */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="notifications-outline" size={20} color="#666" />
                    <Text style={styles.actionText}>Geovalla</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.actionButton} onPress={fetchData}>
                    <Ionicons name="refresh-outline" size={20} color="#666" />
                    <Text style={styles.actionText}>Actualizar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        backgroundColor: '#fff',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    infoBox: {
        flex: 1,
        backgroundColor: '#fff',
        marginLeft: 15,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    petName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    status: { fontSize: 12, color: '#7c9a6b' },
    markerContainer: {
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#7c9a6b',
        elevation: 4,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        flexDirection: 'row',
        paddingVertical: 15,
        borderRadius: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    actionButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    actionText: {
        fontSize: 14,
        marginLeft: 8,
        color: '#666',
        fontWeight: '500',
    },
    divider: {
        width: 1,
        backgroundColor: '#eee',
        height: '100%',
    },
});
