import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PetsListScreenProps } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';

export const PetsListScreen: React.FC<PetsListScreenProps> = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false);
    // Por ahora simulamos una lista vacía
    const pets: any[] = [];

    return (
        <View style={styles.container}>
            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#7c9a6b" />
                </View>
            ) : pets.length === 0 ? (
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
                <View style={styles.listContainer}>
                    {/* Aquí iría la lista de mascotas */}
                </View>
            )}

            {pets.length > 0 && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('AddPet')}
                >
                    <Ionicons name="add" size={30} color="#fff" />
                </TouchableOpacity>
            )}
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
        backgroundColor: '#7c9a6b',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    listContainer: {
        flex: 1,
        padding: 16,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#7c9a6b',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});
