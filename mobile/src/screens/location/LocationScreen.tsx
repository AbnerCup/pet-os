import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LocationScreenProps } from '../../navigation/types';

export const LocationScreen: React.FC<LocationScreenProps> = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Mapa de Ubicación</Text>
            <Text style={styles.subtitle}>Aquí aparecerán tus mascotas en el mapa</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
    },
});
