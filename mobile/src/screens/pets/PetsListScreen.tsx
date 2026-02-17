import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    Image,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { PetsListScreenProps, MainTabParamList, RootStackParamList } from '../../navigation/types';
import { usePets, useDeletePet } from '../../hooks/usePets';
import { getPetImage, calculateAge } from '../../utils/helpers';
import { Pet } from '../../types';

type PetsScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Pets'>,
    NativeStackNavigationProp<RootStackParamList>
>;

export const PetsListScreen: React.FC<PetsListScreenProps> = () => {
    const navigation = useNavigation<PetsScreenNavigationProp>();
    const { data: pets, isLoading, refetch } = usePets();

    const deletePetMutation = useDeletePet();

    const handleActions = (pet: Pet) => {
        Alert.alert(
            pet.name,
            '¿Qué deseas hacer?',
            [
                { text: 'Ver Perfil', onPress: () => navigation.navigate('PetDetail', { petId: pet.id }) },
                { text: 'Editar', onPress: () => navigation.navigate('EditPet', { petId: pet.id }) },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            'Eliminar Mascota',
                            `¿Estás seguro de que deseas eliminar a ${pet.name}? Esta acción no se puede deshacer.`,
                            [
                                { text: 'Cancelar', style: 'cancel' },
                                {
                                    text: 'Eliminar',
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            await deletePetMutation.mutateAsync(pet.id);
                                            Alert.alert('Éxito', 'Mascota eliminada correctamente');
                                        } catch (error) {
                                            Alert.alert('Error', 'No se pudo eliminar la mascota');
                                        }
                                    }
                                }
                            ]
                        );
                    }
                },
                { text: 'Cancelar', style: 'cancel' }
            ]
        );
    };

    const PetItem = ({ item }: { item: Pet }) => (
        <TouchableOpacity
            style={styles.petItem}
            onPress={() => navigation.navigate('PetDetail', { petId: item.id })}
        >
            <Image
                source={{ uri: getPetImage(item.photoUrl, item.species) }}
                style={styles.petImage}
            />
            <View style={styles.petInfo}>
                <Text style={styles.petName}>{item.name}</Text>
                <Text style={styles.petDetails}>
                    {item.breed || item.species} • {calculateAge(item.birthDate || '')} años
                </Text>
            </View>
            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleActions(item)}
            >
                <Ionicons name="ellipsis-vertical" size={20} color="#666" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#5c7a4b" />
                </View>
            ) : !pets || pets.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="paw-outline" size={80} color="#ccc" />
                    <Text style={styles.noPetsTitle}>No hay mascotas aún</Text>
                    <Text style={styles.noPetsSubtitle}>Agrega a tu primer compañero para empezar</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('AddPet')}
                    >
                        <Text style={styles.addButtonText}>Agregar Mascota</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={pets}
                    keyExtractor={(item) => item.id}
                    renderItem={PetItem}
                    contentContainerStyle={styles.listContent}
                    refreshing={isLoading}
                    onRefresh={refetch}
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddPet')}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    petItem: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    petImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12,
    },
    petInfo: {
        flex: 1,
    },
    petName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    petDetails: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    actionButton: {
        padding: 8,
    },
    noPetsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
    },
    noPetsSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    addButton: {
        backgroundColor: '#5c7a4b',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#5c7a4b',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});
