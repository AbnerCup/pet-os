import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackScreenProps } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { userApi } from '../../api/endpoints';
import { useLogger } from '../../hooks/useLogger';

export const EditProfileScreen: React.FC<RootStackScreenProps<'EditProfile'>> = ({ navigation }) => {
    const { user, checkAuth } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [isSaving, setIsSaving] = useState(false);
    const { error } = useLogger({ screenName: 'EditProfileScreen' });

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'El nombre no puede estar vacío');
            return;
        }

        setIsSaving(true);
        try {
            await userApi.updateProfile({ name, phone, email });
            await checkAuth(); // Actualizar el estado local
            Alert.alert('Éxito', 'Perfil actualizado correctamente', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            error('Error actualizando perfil', { 
                response: err.response?.data, 
                message: err.message 
            });
            Alert.alert('Error', 'No se pudo actualizar el perfil. Intenta de nuevo.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar Perfil</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={styles.saveText}>Guardar</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.container}>
                <View style={styles.avatarSection}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={50} color="#7c9a6b" />
                        <TouchableOpacity style={styles.changeAvatarButton}>
                            <Ionicons name="camera" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.changePhotoText}>Cambiar foto de perfil</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nombre completo</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Tu nombre"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Correo electrónico</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="tu@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Teléfono</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="+1 234 567 890"
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.updateButton, isSaving && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    <Text style={styles.updateButtonText}>
                        {isSaving ? 'Guardando...' : 'Actualizar Perfil'}
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
    saveText: {
        fontSize: 16,
        color: '#7c9a6b',
        fontWeight: '600',
    },
    container: {
        flex: 1,
    },
    avatarSection: {
        alignItems: 'center',
        marginVertical: 30,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#e8f0e4',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    changeAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#7c9a6b',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    changePhotoText: {
        marginTop: 12,
        color: '#7c9a6b',
        fontSize: 14,
        fontWeight: '600',
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
        backgroundColor: '#7c9a6b',
        marginHorizontal: 20,
        marginVertical: 30,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#7c9a6b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
