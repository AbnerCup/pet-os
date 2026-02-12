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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAddHealthRecord } from '../../hooks/useHealth';
import { RootStackParamList } from '../../navigation/types';

type AddHealthRecordRouteProp = RouteProp<RootStackParamList, 'AddHealthRecord'>;

const RECORD_TYPES = [
    { label: 'Chequeo', value: 'checkup', icon: '🩺' },
    { label: 'Vacuna', value: 'vaccination', icon: '💉' },
    { label: 'Medicación', value: 'medication', icon: '💊' },
    { label: 'Desparasitación', value: 'deworming', icon: '🐛' },
    { label: 'Cirugía', value: 'surgery', icon: '🏥' },
    { label: 'Otro', value: 'other', icon: '📝' },
];

export const AddHealthRecordScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<AddHealthRecordRouteProp>();
    const { petId } = route.params;

    const [form, setForm] = useState({
        title: '',
        type: 'checkup',
        date: new Date().toISOString().split('T')[0],
        vetName: '',
        weight: '',
        temperature: '',
        notes: '',
        status: 'completed'
    });

    const addMutation = useAddHealthRecord(petId);

    const handleSave = async () => {
        if (!form.title) {
            Alert.alert('Error', 'Por favor ingresa un título');
            return;
        }

        try {
            await addMutation.mutateAsync({
                ...form,
                weight: form.weight ? parseFloat(form.weight) : undefined,
                temperature: form.temperature ? parseFloat(form.temperature) : undefined,
            });
            Alert.alert('Éxito', 'Registro de salud guardado correctamente');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar el registro');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Nuevo Registro Médico</Text>
                <TouchableOpacity onPress={handleSave} disabled={addMutation.isPending}>
                    {addMutation.isPending ? (
                        <ActivityIndicator size="small" color="#7c9a6b" />
                    ) : (
                        <Text style={styles.saveButtonText}>Guardar</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.label}>Título</Text>
                    <TextInput
                        style={styles.input}
                        value={form.title}
                        onChangeText={(text) => setForm({ ...form, title: text })}
                        placeholder="Ej: Vacuna Triple Felina"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Tipo de Registro</Text>
                    <View style={styles.typeGrid}>
                        {RECORD_TYPES.map((type) => (
                            <TouchableOpacity
                                key={type.value}
                                style={[
                                    styles.typeItem,
                                    form.type === type.value && styles.typeItemActive
                                ]}
                                onPress={() => setForm({ ...form, type: type.value })}
                            >
                                <Text style={styles.typeIcon}>{type.icon}</Text>
                                <Text style={[
                                    styles.typeLabel,
                                    form.type === type.value && styles.typeLabelActive
                                ]}>{type.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={[styles.section, styles.row]}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.label}>Fecha</Text>
                        <TextInput
                            style={styles.input}
                            value={form.date}
                            onChangeText={(text) => setForm({ ...form, date: text })}
                            placeholder="YYYY-MM-DD"
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Veterinario</Text>
                        <TextInput
                            style={styles.input}
                            value={form.vetName}
                            onChangeText={(text) => setForm({ ...form, vetName: text })}
                            placeholder="Nombre del doctor"
                        />
                    </View>
                </View>

                <View style={[styles.section, styles.row]}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.label}>Peso (kg)</Text>
                        <TextInput
                            style={styles.input}
                            value={form.weight}
                            onChangeText={(text) => setForm({ ...form, weight: text })}
                            placeholder="0.0"
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Temperatura (°C)</Text>
                        <TextInput
                            style={styles.input}
                            value={form.temperature}
                            onChangeText={(text) => setForm({ ...form, temperature: text })}
                            placeholder="38.5"
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Notas y Observaciones</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={form.notes}
                        onChangeText={(text) => setForm({ ...form, notes: text })}
                        placeholder="Cualquier detalle relevante..."
                        multiline
                        numberOfLines={4}
                    />
                </View>
            </ScrollView>
        </View>
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
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: { padding: 5 },
    navTitle: { fontSize: 17, fontWeight: 'bold', color: '#333' },
    saveButtonText: { fontSize: 16, fontWeight: 'bold', color: '#7c9a6b' },
    content: { flex: 1, padding: 20 },
    section: { marginBottom: 20 },
    row: { flexDirection: 'row' },
    label: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 8 },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 15,
        fontSize: 15,
        color: '#333',
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
    typeItem: {
        width: '30%',
        margin: '1.5%',
        padding: 10,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    typeItemActive: {
        backgroundColor: '#f0f5ee',
        borderColor: '#7c9a6b',
    },
    typeIcon: { fontSize: 20, marginBottom: 5 },
    typeLabel: { fontSize: 11, color: '#666' },
    typeLabelActive: { color: '#7c9a6b', fontWeight: 'bold' },
});
