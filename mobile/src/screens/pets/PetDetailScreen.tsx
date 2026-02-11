import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { usePet } from '../../hooks/usePets';
import { getPetImage, calculateAge } from '../../utils/helpers';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

export const PetDetailScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { petId } = route.params;
    const { data: pet, isLoading } = usePet(petId);

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#7c9a6b" />
            </View>
        );
    }

    if (!pet) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="alert-circle" size={48} color="#e74c3c" />
                <Text style={styles.errorText}>Mascota no encontrada</Text>
            </View>
        );
    }

    const age = pet.birthDate ? calculateAge(pet.birthDate) : '-';

    return (
        <ScrollView style={styles.container}>
            {/* Header Profile */}
            <View style={styles.header}>
                <Image
                    source={{ uri: getPetImage(pet.photoUrl, pet.species) }}
                    style={styles.profileImage}
                />
                <View style={styles.headerInfo}>
                    <Text style={styles.name}>{pet.name}</Text>
                    <Text style={styles.breed}>{pet.breed || pet.species}</Text>

                    <View style={styles.badgeRow}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{age} años</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: '#e3f2fd' }]}>
                            <Text style={[styles.badgeText, { color: '#1976d2' }]}>{pet.weight || '-'} kg</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Quick Actions Grid */}
            <View style={styles.actionsGrid}>
                <ActionCard
                    icon="medical"
                    color="#e74c3c"
                    title="Salud"
                    onPress={() => navigation.navigate('HealthHub', { petId: pet.id, petName: pet.name })}
                />
                <ActionCard
                    icon="location"
                    color="#4a90e2"
                    title="Ubicación"
                    onPress={() => navigation.navigate('PetTracking', { petId: pet.id })}
                />
                <ActionCard
                    icon="calendar"
                    color="#f5a623"
                    title="Agenda"
                    onPress={() => navigation.navigate('Agenda', { petId: pet.id, petName: pet.name })}
                />
                <ActionCard
                    icon="settings"
                    color="#666"
                    title="Editar"
                    onPress={() => navigation.navigate('EditPet', { petId: pet.id })}
                />
            </View>

            {/* Additional Info / Recent Activity Placeholder */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Más información</Text>
                <View style={styles.infoCard}>
                    <InfoRow icon="calendar-outline" label="Fecha de Nacimiento" value={pet.birthDate ? new Date(pet.birthDate).toLocaleDateString() : 'No registrada'} />
                    <InfoRow icon="paw-outline" label="Especie" value={pet.species} />
                    <InfoRow icon="time-outline" label="Registrado el" value={new Date(pet.createdAt).toLocaleDateString()} />
                </View>
            </View>
        </ScrollView>
    );
};

const ActionCard = ({ icon, color, title, onPress }: any) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
        <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={28} color={color} />
        </View>
        <Text style={styles.actionTitle}>{title}</Text>
    </TouchableOpacity>
);

const InfoRow = ({ icon, label, value }: any) => (
    <View style={styles.infoRow}>
        <Ionicons name={icon} size={20} color="#666" style={{ marginRight: 12 }} />
        <View>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#fff',
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#eee',
    },
    headerInfo: {
        flex: 1,
        marginLeft: 20,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    breed: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    badgeRow: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 8,
    },
    badge: {
        backgroundColor: '#f1f8e9',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#7c9a6b',
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 12,
        justifyContent: 'space-between',
    },
    actionCard: {
        backgroundColor: '#fff',
        width: '48%',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    section: {
        padding: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    infoLabel: {
        fontSize: 12,
        color: '#999',
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        marginTop: 2,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        marginTop: 12,
    },
});
