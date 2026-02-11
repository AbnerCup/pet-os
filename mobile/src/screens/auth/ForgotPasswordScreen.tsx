import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackScreenProps } from '../../navigation/types';

type Props = AuthStackScreenProps<'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.text}>Recuperar Contraseña</Text>
            <Text style={styles.subtitle}>Ingresa tu email para recibir un enlace de recuperación</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
    },
    backButton: {
        marginTop: 40,
        marginBottom: 20,
    },
    text: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
    },
});
