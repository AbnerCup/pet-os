import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { usePet } from '../../hooks/usePets';
import { petsApi, uploadApi } from '../../api/endpoints';
import { useQueryClient } from '@tanstack/react-query';
import { getPetImage } from '../../utils/helpers';
import { useLogger } from '../../hooks/useLogger';

export const EditPetScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const queryClient = useQueryClient();
    const { petId } = route.params;
    const { data: pet, isLoading: isFetching } = usePet(petId);
    const { error } = useLogger({ screenName: 'EditPetScreen' });

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        species: '',
        breed: '',
        weight: '',
        birthDate: '',
    });
    const [image, setImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (pet) {
            setFormData({
                name: pet.name || '',
                species: pet.species || '',
                breed: pet.breed || '',
                weight: pet.weight?.toString() || '',
                birthDate: pet.birthDate ? pet.birthDate.split('T')[0] : '',
            });
            if (pet.photoUrl) {
                setImage(getPetImage(pet.photoUrl, pet.species));
            }
        }
    }, [pet]);

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
            Alert.alert('Error', 'No se pudo acceder a la galería');
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.species) {
            Alert.alert('Error', 'Nombre y especie son requeridos');
            return;
        }

        setLoading(true);
        let photoUrl = pet?.photoUrl;

        try {
            // Solo subir si es una imagen local nueva
            if (image && image.startsWith('file://')) {
                setIsUploading(true);
                const formDataUpload = new FormData();
                const uriParts = image.split('.');
                const fileType = uriParts[uriParts.length - 1];

                formDataUpload.append('file', {
                    uri: image,
                    name: `photo.${fileType}`,
                    type: `image/${fileType}`,
                } as any);

                const uploadRes = await uploadApi.image(formDataUpload);
                if (uploadRes.data.success) {
                    photoUrl = uploadRes.data.data.imageUrl;
                }
            }

            await petsApi.update(petId, {
                ...formData,
                weight: formData.weight ? parseFloat(formData.weight) : undefined,
                photoUrl: photoUrl || undefined
            });

            queryClient.invalidateQueries({ queryKey: ['pets'] });
            queryClient.invalidateQueries({ queryKey: ['pet', petId] });
            Alert.alert('Éxito', 'Mascota actualizada correctamente');
            navigation.goBack();
        } catch (err: any) {
            error('Error actualizando mascota', { 
                petId, 
                response: err.response?.data, 
                message: err.message 
            });
            Alert.alert('Error', 'No se pudo actualizar la mascota. Verifica tu conexión a internet.');
        } finally {
            setLoading(false);
            setIsUploading(false);
        }
    };

    if (isFetching) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#5c7a4b" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.imageContainer}>
                <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Ionicons name="camera" size={40} color="#999" />
                            <Text style={styles.placeholderText}>Cambiar Foto</Text>
                        </View>
                    )}
                    <View style={styles.editBadge}>
                        <Ionicons name="pencil" size={16} color="#fff" />
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    placeholder="Ej. Luna"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Especie *</Text>
                <TextInput
                    style={styles.input}
                    value={formData.species}
                    onChangeText={(text) => setFormData({ ...formData, species: text })}
                    placeholder="Ej. Perro, Gato..."
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Raza</Text>
                <TextInput
                    style={styles.input}
                    value={formData.breed}
                    onChangeText={(text) => setFormData({ ...formData, breed: text })}
                    placeholder="Ej. Golden Retriever"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Peso (kg)</Text>
                <TextInput
                    style={styles.input}
                    value={formData.weight}
                    onChangeText={(text) => setFormData({ ...formData, weight: text })}
                    keyboardType="numeric"
                    placeholder="Ej. 12.5"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Fecha de Nacimiento (YYYY-MM-DD)</Text>
                <TextInput
                    style={styles.input}
                    value={formData.birthDate}
                    onChangeText={(text) => setFormData({ ...formData, birthDate: text })}
                    placeholder="2020-01-01"
                />
            </View>

            <TouchableOpacity
                style={[styles.saveButton, (loading || isUploading) && styles.disabledButton]}
                onPress={handleSave}
                disabled={loading || isUploading}
            >
                {loading || isUploading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#eee',
    },
    saveButton: {
        backgroundColor: '#5c7a4b',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.6,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 25,
    },
    imagePicker: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        borderWidth: 1,
        borderColor: '#eee',
    },
    previewImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    placeholderImage: {
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    editBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#5c7a4b',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    }
});
