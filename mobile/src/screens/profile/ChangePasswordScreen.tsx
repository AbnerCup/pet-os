import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackScreenProps } from '../../navigation/types';
import { userApi } from '../../api/endpoints';
import { useLogger } from '../../hooks/useLogger';

export const ChangePasswordScreen: React.FC<RootStackScreenProps<'ChangePassword'>> = ({ navigation }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { error } = useLogger({ screenName: 'ChangePasswordScreen' });

    const handleSave = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Por favor, completa todos los campos');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }

        setIsSaving(true);
        try {
            await userApi.changePassword(currentPassword, newPassword);
            Alert.alert('Éxito', 'Contraseña actualizada correctamente', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            error('Error cambiando contraseña', { 
                response: err.response?.data, 
                message: err.message 
            });
            const errorMessage = err.response?.data?.error || 'No se pudo cambiar la contraseña. Verifica tu contraseña actual.';
            Alert.alert('Error', errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cambiar Contraseña</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.container}>
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color="#5c7a4b" />
                    <Text style={styles.infoText}>
                        Tu contraseña debe tener al menos 8 caracteres e incluir letras y números.
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Contraseña actual</Text>
                        <TextInput
                            style={styles.input}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="••••••••"
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nueva contraseña</Text>
                        <TextInput
                            style={styles.input}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="••••••••"
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirmar nueva contraseña</Text>
                        <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="••••••••"
                            secureTextEntry
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.updateButton, isSaving && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    <Text style={styles.updateButtonText}>
                        {isSaving ? 'Cambiando...' : 'Cambiar Contraseña'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    container: {
        flex: 1,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#e8f0e4',
        margin: 20,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        color: '#4e6144',
        fontSize: 14,
        marginLeft: 12,
    },
    form: {
        paddingHorizontal: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#f9f9f9',
    },
    updateButton: {
        backgroundColor: '#5c7a4b',
        marginHorizontal: 20,
        marginVertical: 30,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
