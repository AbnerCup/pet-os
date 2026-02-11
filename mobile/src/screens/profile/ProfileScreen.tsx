import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileScreenProps } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={50} color="#7c9a6b" />
                </View>
                <Text style={styles.name}>{user?.name || 'Usuario'}</Text>
                <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>

                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate('EditProfile')}
                >
                    <Text style={styles.editButtonText}>Editar Perfil</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Configuración</Text>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <Ionicons name="settings-outline" size={24} color="#666" />
                    <Text style={styles.menuItemText}>Ajustes</Text>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('Notifications')}
                >
                    <Ionicons name="notifications-outline" size={24} color="#666" />
                    <Text style={styles.menuItemText}>Notificaciones</Text>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color="#ff4d4d" />
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        padding: 32,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#e8f0e4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
    },
    editButton: {
        borderWidth: 1,
        borderColor: '#7c9a6b',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    editButtonText: {
        color: '#7c9a6b',
        fontSize: 14,
        fontWeight: '600',
    },
    section: {
        backgroundColor: '#fff',
        marginTop: 20,
        paddingVertical: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#999',
        marginLeft: 16,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f9f9f9',
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        marginTop: 20,
        padding: 16,
        marginBottom: 40,
    },
    logoutText: {
        fontSize: 16,
        color: '#ff4d4d',
        fontWeight: '600',
        marginLeft: 8,
    },
});
