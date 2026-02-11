import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LocationScreenProps } from '../../navigation/types';
import { usePets } from '../../hooks/usePets';
import { Pet } from '../../types';
import { getPetImage } from '../../utils/helpers';
import { locationApi } from '../../api/endpoints';

export const LocationScreen: React.FC<LocationScreenProps> = () => {
    const navigation = useNavigation<any>();
    const { data: pets, isLoading: isPetsLoading } = usePets();

    const [locations, setLocations] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAllLocations();
        const interval = setInterval(fetchAllLocations, 60000); // Cada minuto
        return () => clearInterval(interval);
    }, [pets]);

    const fetchAllLocations = async () => {
        if (!pets) return;

        try {
            const locPromises = pets.map(pet =>
                locationApi.getCurrent(pet.id)
                    .then(res => ({ petId: pet.id, location: res.data }))
                    .catch(() => ({ petId: pet.id, location: null }))
            );

            const results = await Promise.all(locPromises);
            const newLocations: Record<string, any> = {};
            results.forEach((res: any) => {
                if (res.location) newLocations[res.petId] = res.location;
            });
            setLocations(newLocations);
        } catch (error) {
            console.error('Error fetching all locations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isPetsLoading && isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#7c9a6b" />
            </View>
        );
    }

    // Centrar el mapa en la primera mascota encontrada o ubicación por defecto
    const firstPetIdWithLoc = Object.keys(locations)[0];
    const initialRegion = firstPetIdWithLoc ? {
        latitude: locations[firstPetIdWithLoc].latitude,
        longitude: locations[firstPetIdWithLoc].longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    } : {
        latitude: -12.046374,
        longitude: -77.042793,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={initialRegion}
                provider={PROVIDER_GOOGLE}
            >
                {pets?.map((pet: Pet) => {
                    const loc = locations[pet.id];
                    if (!loc) return null;

                    return (
                        <Marker
                            key={pet.id}
                            coordinate={{
                                latitude: loc.latitude,
                                longitude: loc.longitude,
                            }}
                            onCalloutPress={() => navigation.navigate('PetDetail', { petId: pet.id })}
                        >
                            <View style={styles.customMarker}>
                                <Image
                                    source={{ uri: getPetImage(pet.photoUrl, pet.species) }}
                                    style={styles.markerImage}
                                />
                                <View style={styles.markerArrow} />
                            </View>
                        </Marker>
                    );
                })}
            </MapView>

            {/* Top Search / Filter Placeholder */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#999" />
                    <Text style={styles.searchText}>Buscar mascota...</Text>
                </View>
            </View>

            {/* Tracking overlay buttons */}
            <View style={styles.overlayButtons}>
                <TouchableOpacity style={styles.roundButton} onPress={fetchAllLocations}>
                    <Ionicons name="refresh" size={24} color="#333" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    searchContainer: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        zIndex: 1,
    },
    searchBar: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 12,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    searchText: { color: '#999', marginLeft: 10, fontSize: 16 },
    overlayButtons: {
        position: 'absolute',
        right: 20,
        bottom: 100,
        gap: 15,
    },
    roundButton: {
        backgroundColor: '#fff',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    customMarker: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 3,
        borderColor: '#7c9a6b',
    },
    markerArrow: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#7c9a6b',
        marginTop: -1,
    },
});
