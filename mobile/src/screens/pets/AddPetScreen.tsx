import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCreatePet, usePets } from '../../hooks/usePets';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as ImagePicker from 'expo-image-picker';
import { uploadApi } from '../../api/endpoints';
import { useLogger } from '../../hooks/useLogger';

const SPECIES = [
    { id: 'dog', label: 'Perro', icon: 'paw' },
    { id: 'cat', label: 'Gato', icon: 'paw' },
    { id: 'bird', label: 'Ave', icon: 'leaf' },
    { id: 'other', label: 'Otro', icon: 'help-circle' },
];

export const AddPetScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const { data: pets } = usePets();
    const createPetMutation = useCreatePet();
    
    // Usar el logger - funciona igual en desarrollo y APK
    const { debug, info, error } = useLogger({ screenName: 'AddPetScreen' });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [date, setDate] = useState(new Date());
    const [image, setImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        species: 'dog',
        breed: '',
        weight: '',
        birthDate: new Date().toISOString(),
    });

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
            setFormData({ ...formData, birthDate: selectedDate.toISOString() });
        }
    };

    const petCount = pets?.length || 0;
    const maxPets = user?.plan === 'FREE' ? 1 : user?.plan === 'BASIC' ? 3 : 999;
    const canAddMore = petCount < maxPets;

    // Log de estado - se verá en consola en dev, se enviará al servidor en APK
    debug('Estado de pantalla', {
        petCount,
        maxPets,
        plan: user?.plan,
        canAddMore,
        userId: user?.id,
        isSuccess: !!pets
    });

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo abrir la galería');
        }
    };
    const handleSave = async () => {
        if (!formData.name) {
            Alert.alert('Error', 'Por favor ingresa el nombre de tu mascota');
            return;
        }

        try {
            setIsUploading(true);
            let photoUrl = '';

            if (image) {
                const uriParts = image.split('.');
                const fileType = uriParts[uriParts.length - 1];
                const formDataFile = new FormData();

                // Construct file object for upload
                formDataFile.append('file', {
                    uri: image,
                    name: `photo.${fileType}`,
                    type: `image/${fileType}`,
                } as any);

                const uploadResponse = await uploadApi.image(formDataFile);
                if (uploadResponse.data.success) {
                    photoUrl = uploadResponse.data.data.imageUrl;
                }
            }

            info('Registrando mascota', { name: formData.name, species: formData.species });
            
            await createPetMutation.mutateAsync({
                ...formData,
                weight: formData.weight ? parseFloat(formData.weight) : undefined,
                photoUrl: photoUrl || undefined,
            });
            
            info('Mascota registrada exitosamente', { name: formData.name });
            Alert.alert('¡Bienvenido!', `${formData.name} ya es parte de la familia Pet OS`);
            navigation.goBack();
        } catch (err: any) {
            error('Error al registrar mascota', { 
                message: err.message, 
                response: err.response?.data,
                formData: { name: formData.name, species: formData.species }
            });
            const errorMessage = err.response?.data?.error || 'No se pudo registrar la mascota. Verifica los datos.';
            Alert.alert('Error', errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    if (!canAddMore) {
        return (
            <View style={styles.limitContainer}>
                <Ionicons name="lock-closed" size={80} color="#f5a623" />
                <Text style={styles.limitTitle}>Límite de Plan Alcanzado</Text>
                <Text style={styles.limitText}>
                    Tu plan actual ({user?.plan}) permite un máximo de {maxPets} mascota{maxPets > 1 ? 's' : ''}.
                    Llevas {petCount} registrada{petCount > 1 ? 's' : ''}.
                </Text>
                <TouchableOpacity
                    style={styles.upgradeButton}
                    onPress={() => Alert.alert('Mejorar Plan', 'Esta función estará disponible pronto en la suscripción premium.')}
                >
                    <Text style={styles.upgradeButtonText}>Mejorar mi Plan</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Nueva Mascota</Text>
                    <Text style={styles.subtitle}>Completa los datos para empezar el seguimiento</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.photoContainer}>
                        <TouchableOpacity style={styles.photoPicker} onPress={pickImage}>
                            {image ? (
                                <View style={styles.imageWrapper}>
                                    <View style={styles.imageOverlay}>
                                        <Ionicons name="camera" size={20} color="#fff" />
                                    </View>
                                    <Text style={styles.imageText}>Cambiar</Text>
                                    <View style={{ width: 100, height: 100, borderRadius: 50, overflow: 'hidden', borderWidth: 2, borderColor: '#fff' }}>
                                        <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} />
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.photoPlaceholder}>
                                    <Ionicons name="camera-outline" size={32} color="#7c9a6b" />
                                    <Text style={styles.photoPlaceholderText}>Añadir Foto</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>¿Cómo se llama? *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="Ej. Toby"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Especie *</Text>
                        <View style={styles.speciesGrid}>
                            {SPECIES.map((s) => (
                                <TouchableOpacity
                                    key={s.id}
                                    style={[
                                        styles.speciesCard,
                                        formData.species === s.id && styles.activeSpeciesCard,
                                    ]}
                                    onPress={() => setFormData({ ...formData, species: s.id })}
                                >
                                    <Ionicons
                                        name={s.icon as any}
                                        size={24}
                                        color={formData.species === s.id ? '#fff' : '#7c9a6b'}
                                    />
                                    <Text style={[
                                        styles.speciesLabel,
                                        formData.species === s.id && styles.activeSpeciesLabel
                                    ]}>
                                        {s.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Raza (Opcional)</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.breed}
                            onChangeText={(text) => setFormData({ ...formData, breed: text })}
                            placeholder="Ej. San Bernardo"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
                            <Text style={styles.label}>Peso (kg)</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.weight}
                                onChangeText={(text) => setFormData({ ...formData, weight: text })}
                                keyboardType="numeric"
                                placeholder="0.0"
                                placeholderTextColor="#999"
                            />
                        </View>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Fecha Nacimiento</Text>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Ionicons name="calendar-outline" size={20} color="#7c9a6b" style={{ marginRight: 8 }} />
                                <Text style={styles.dateInputText}>
                                    {format(date, 'dd/MM/yyyy', { locale: es })}
                                </Text>
                            </TouchableOpacity>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onDateChange}
                                    maximumDate={new Date()}
                                />
                            )}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, (createPetMutation.isPending || isUploading) && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={createPetMutation.isPending || isUploading}
                    >
                        {createPetMutation.isPending || isUploading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="add-circle-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.saveButtonText}>Registrar Mascota</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.planInfo}>
                    <Ionicons name="information-circle-outline" size={16} color="#666" />
                    <Text style={styles.planInfoText}>
                        Uso de plan {user?.plan}: {petCount}/{maxPets} mascotas registradas.
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 24,
    },
    header: {
        marginBottom: 32,
        marginTop: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
    },
    form: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        paddingTop: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginTop: 40,
    },
    photoContainer: {
        alignItems: 'center',
        marginTop: -80,
        marginBottom: 20,
    },
    photoPicker: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f0f5ee',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    photoPlaceholder: {
        alignItems: 'center',
    },
    photoPlaceholderText: {
        fontSize: 10,
        color: '#7c9a6b',
        marginTop: 4,
        fontWeight: 'bold',
    },
    imageWrapper: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageOverlay: {
        position: 'absolute',
        zIndex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageText: {
        position: 'absolute',
        bottom: 10,
        zIndex: 2,
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 10,
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#eee',
    },
    dateInput: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#eee',
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateInputText: {
        fontSize: 16,
        color: '#333',
    },
    speciesGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    speciesCard: {
        flex: 1,
        backgroundColor: '#f0f5ee',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0eade',
    },
    activeSpeciesCard: {
        backgroundColor: '#7c9a6b',
        borderColor: '#7c9a6b',
    },
    speciesLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#7c9a6b',
        marginTop: 6,
    },
    activeSpeciesLabel: {
        color: '#fff',
    },
    row: {
        flexDirection: 'row',
    },
    saveButton: {
        backgroundColor: '#7c9a6b',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: '#7c9a6b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.6,
    },
    planInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        gap: 6,
    },
    planInfoText: {
        fontSize: 12,
        color: '#666',
    },
    limitContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#fff',
    },
    limitTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        textAlign: 'center',
    },
    limitText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 24,
    },
    upgradeButton: {
        backgroundColor: '#f5a623',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 25,
        marginTop: 32,
    },
    upgradeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
