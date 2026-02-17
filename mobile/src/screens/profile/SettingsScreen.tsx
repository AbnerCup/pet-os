import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackScreenProps } from '../../navigation/types';

export const SettingsScreen: React.FC<RootStackScreenProps<'Settings'>> = ({ navigation }) => {
    const [pushEnabled, setPushEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [emailUpdates, setEmailUpdates] = useState(true);

    const renderSettingItem = (
        icon: string,
        title: string,
        onPress?: () => void,
        value?: boolean,
        onValueChange?: (value: boolean) => void,
        color: string = '#666'
    ) => (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon as any} size={22} color={color} />
            </View>
            <Text style={styles.settingText}>{title}</Text>
            {onValueChange !== undefined ? (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: '#ddd', true: '#5c7a4b' }}
                    thumbColor="#fff"
                />
            ) : (
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ajustes</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.container}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cuenta</Text>
                    {renderSettingItem('person-outline', 'Editar Perfil', () => navigation.navigate('EditProfile'), undefined, undefined, '#4a90e2')}
                    {renderSettingItem('lock-closed-outline', 'Cambiar Contraseña', () => navigation.navigate('ChangePassword'), undefined, undefined, '#f5a623')}
                    {renderSettingItem('notifications-outline', 'Notificaciones App', () => navigation.navigate('Notifications'), undefined, undefined, '#5c7a4b')}
                </View>

                <View style={sectionStyles.section}>
                    <Text style={styles.sectionTitle}>Preferencias</Text>
                    {renderSettingItem('notifications-circle-outline', 'Notificaciones Push', undefined, pushEnabled, setPushEnabled, '#ff4d4d')}
                    {renderSettingItem('mail-outline', 'Actualizaciones por Email', undefined, emailUpdates, setEmailUpdates, '#9b59b6')}
                    {renderSettingItem('moon-outline', 'Modo Oscuro', undefined, darkMode, setDarkMode, '#34495e')}
                </View>

                {/* Sección de Desarrollo - solo visible en modo desarrollo */}
                {__DEV__ && (
                    <View style={sectionStyles.section}>
                        <Text style={styles.sectionTitle}>Desarrollo</Text>
                        {renderSettingItem('bug-outline', 'Ver Logs de Desarrollo', () => navigation.navigate('DevLogs'), undefined, undefined, '#e74c3c')}
                        {renderSettingItem('code-outline', 'Modo: DESARROLLO', () => {}, undefined, undefined, '#2ecc71')}
                    </View>
                )}

                <View style={sectionStyles.section}>
                    <Text style={styles.sectionTitle}>Más información</Text>
                    {renderSettingItem('information-circle-outline', 'Acerca de Pet OS', () => { }, undefined, undefined, '#666')}
                    {renderSettingItem('shield-checkmark-outline', 'Política de Privacidad', () => { }, undefined, undefined, '#666')}
                    {renderSettingItem('help-circle-outline', 'Ayuda y Soporte', () => { }, undefined, undefined, '#666')}
                </View>

                <TouchableOpacity style={styles.deleteAccount}>
                    <Text style={styles.deleteAccountText}>Eliminar Cuenta</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Versión 1.0.0 (Build 52)</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const sectionStyles = StyleSheet.create({
    section: {
        backgroundColor: '#fff',
        marginTop: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    }
});

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    container: {
        flex: 1,
    },
    section: {
        backgroundColor: '#fff',
        marginTop: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#adb5bd',
        marginBottom: 12,
        marginTop: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f5',
    },
    iconContainer: {
        width: 38,
        height: 38,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    settingText: {
        flex: 1,
        fontSize: 16,
        color: '#495057',
        fontWeight: '500',
    },
    deleteAccount: {
        marginTop: 30,
        marginBottom: 20,
        alignItems: 'center',
    },
    deleteAccountText: {
        color: '#ff4d4d',
        fontSize: 16,
        fontWeight: '600',
    },
    versionText: {
        textAlign: 'center',
        color: '#adb5bd',
        fontSize: 12,
        marginBottom: 40,
    },
});
