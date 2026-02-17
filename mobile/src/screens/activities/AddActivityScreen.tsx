import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { usePets } from '../../hooks/usePets';
import { useAddActivity } from '../../hooks/useActivities';
import { RootStackParamList } from '../../navigation/types';
import { useLogger } from '../../hooks/useLogger';

type AddActivityRouteProp = RouteProp<RootStackParamList, 'AddActivity'>;

export const AddActivityScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<AddActivityRouteProp>();
    const { petId: initialPetId } = route.params || {};
    const { error } = useLogger({ screenName: 'AddActivityScreen' });

    const { data: pets } = usePets();
    const addActivityMutation = useAddActivity();

    const [form, setForm] = useState({
        petId: initialPetId || '',
        type: 'walk',
        duration: '',
        date: new Date(),
        notes: '',
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const activityTypes = [
        { id: 'walk', label: 'Paseo', icon: '🚶' },
        { id: 'play', label: 'Juego', icon: '🎾' },
        { id: 'training', label: 'Entrenamiento', icon: '🎯' },
        { id: 'exercise', label: 'Ejercicio', icon: '💪' },
        { id: 'social', label: 'Socialización', icon: '🐕' },
        { id: 'other', label: 'Otro', icon: '📝' },
    ];

    const handleSubmit = async () => {
        if (!form.petId) return Alert.alert('Error', 'Debes seleccionar una mascota');
        if (!form.duration || isNaN(Number(form.duration))) {
            return Alert.alert('Error', 'Ingresa una duración válida en minutos');
        }

        setIsSubmitting(true);
        try {
            await addActivityMutation.mutateAsync({
                petId: form.petId,
                type: form.type,
                duration: Number(form.duration),
                date: form.date.toISOString(),
                notes: form.notes,
            });
            Alert.alert('¡Éxito!', 'Actividad registrada correctamente');
            navigation.goBack();
        } catch (err) {
            error('Error guardando actividad', err);
            Alert.alert('Error', 'No se pudo guardar la actividad');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Nueva Actividad</Text>
                <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#5c7a4b" />
                    ) : (
                        <Text style={styles.saveText}>Guardar</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionLabel}>¿Para quién?</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petSelector}>
                    {pets?.map((pet) => (
                        <TouchableOpacity
                            key={pet.id}
                            onPress={() => setForm({ ...form, petId: pet.id })}
                            style={[
                                styles.petChip,
                                form.petId === pet.id && styles.petChipSelected
                            ]}
                        >
                            <Text style={[
                                styles.petChipText,
                                form.petId === pet.id && styles.petChipTextSelected
                            ]}>
                                {pet.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={styles.sectionLabel}>Tipo de actividad</Text>
                <View style={styles.typesGrid}>
                    {activityTypes.map((type) => (
                        <TouchableOpacity
                            key={type.id}
                            onPress={() => setForm({ ...form, type: type.id })}
                            style={[
                                styles.typeItem,
                                form.type === type.id && styles.typeItemSelected
                            ]}
                        >
                            <Text style={styles.typeIcon}>{type.icon}</Text>
                            <Text style={[
                                styles.typeLabel,
                                form.type === type.id && styles.typeLabelSelected
                            ]}>
                                {type.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.sectionLabel}>Detalles</Text>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Duración (minutos)</Text>
                    <View style={styles.inputWithIcon}>
                        <Ionicons name="time-outline" size={20} color="#666" />
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: 30"
                            keyboardType="numeric"
                            value={form.duration}
                            onChangeText={(val) => setForm({ ...form, duration: val })}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Fecha</Text>
                    <TouchableOpacity
                        style={styles.inputWithIcon}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Ionicons name="calendar-outline" size={20} color="#666" />
                        <Text style={styles.inputText}>
                            {format(form.date, "dd 'de' MMMM, yyyy", { locale: es })}
                        </Text>
                    </TouchableOpacity>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={form.date}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) setForm({ ...form, date: selectedDate });
                        }}
                    />
                )}

                <View style={[styles.inputGroup, { marginBottom: 30 }]}>
                    <Text style={styles.label}>Notas (opcional)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="¿Cómo estuvo el paseo?"
                        multiline
                        numberOfLines={3}
                        value={form.notes}
                        onChangeText={(val) => setForm({ ...form, notes: val })}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    <Text style={styles.submitButtonText}>Registrar Actividad</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    navTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    saveText: { color: '#5c7a4b', fontWeight: 'bold', fontSize: 16 },
    content: { padding: 20 },
    sectionLabel: { fontSize: 13, color: '#999', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 12, marginTop: 10 },
    petSelector: { marginBottom: 20 },
    petChip: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 10 },
    petChipSelected: { backgroundColor: '#5c7a4b' },
    petChipText: { color: '#666', fontWeight: '500' },
    petChipTextSelected: { color: '#fff' },
    typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    typeItem: {
        width: '31%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f0f0f0'
    },
    typeItemSelected: { borderColor: '#5c7a4b', backgroundColor: '#f0f5ee' },
    typeIcon: { fontSize: 24, marginBottom: 5 },
    typeLabel: { fontSize: 11, color: '#666' },
    typeLabelSelected: { color: '#5c7a4b', fontWeight: 'bold' },
    inputGroup: { marginBottom: 15 },
    label: { fontSize: 14, color: '#333', marginBottom: 8, fontWeight: '500' },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#eee',
        height: 50,
    },
    input: { flex: 1, height: '100%', marginLeft: 10, fontSize: 15, color: '#333' },
    inputText: { marginLeft: 10, fontSize: 15, color: '#333' },
    textArea: { height: 100, textAlignVertical: 'top', paddingTop: 12 },
    submitButton: {
        backgroundColor: '#5c7a4b',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#5c7a4b',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    submitButtonDisabled: { opacity: 0.7 },
    submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
