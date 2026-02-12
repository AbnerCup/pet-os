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
import { useRoute, useNavigation } from '@react-navigation/native';
import { usePets } from '../../hooks/usePets';
import { useAddExpense } from '../../hooks/useExpenses';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Platform } from 'react-native';

const CATEGORIES = ['Alimentación', 'Salud', 'Juguetes', 'Higiene', 'Otros'];

export const AddExpenseScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { data: pets } = usePets();
    const addExpenseMutation = useAddExpense();

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [date, setDate] = useState(new Date());

    const [formData, setFormData] = useState({
        petId: route.params?.petId || '',
        category: 'Alimentación',
        amount: '',
        date: new Date().toISOString(),
        description: '',
    });

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
            setFormData({ ...formData, date: selectedDate.toISOString() });
        }
    };

    const handleSave = async () => {
        if (!formData.petId) {
            Alert.alert('Error', 'Por favor selecciona una mascota');
            return;
        }
        if (!formData.amount || isNaN(parseFloat(formData.amount))) {
            Alert.alert('Error', 'Por favor ingresa un monto válido');
            return;
        }

        try {
            await addExpenseMutation.mutateAsync({
                ...formData,
                amount: formData.amount.toString(), // El backend espera string para transformarlo
            });
            Alert.alert('Éxito', 'Gasto registrado correctamente');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'No se pudo registrar el gasto');
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.sectionTitle}>Registrar Gasto</Text>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Selecciona Mascota *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petSelector}>
                    {pets?.map((pet) => (
                        <TouchableOpacity
                            key={pet.id}
                            style={[
                                styles.petChip,
                                formData.petId === pet.id && styles.activePetChip,
                            ]}
                            onPress={() => setFormData({ ...formData, petId: pet.id })}
                        >
                            <Text style={[
                                styles.petChipText,
                                formData.petId === pet.id && styles.activePetChipText,
                            ]}>
                                {pet.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Categoría *</Text>
                <View style={styles.categoryGrid}>
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.categoryChip,
                                formData.category === cat && styles.activeCategoryChip,
                            ]}
                            onPress={() => setFormData({ ...formData, category: cat })}
                        >
                            <Text style={[
                                styles.categoryChipText,
                                formData.category === cat && styles.activeCategoryChipText,
                            ]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Monto (Bs.) *</Text>
                <TextInput
                    style={styles.input}
                    value={formData.amount}
                    onChangeText={(text) => setFormData({ ...formData, amount: text })}
                    keyboardType="numeric"
                    placeholder="0.00"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Fecha del Gasto *</Text>
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

            <View style={styles.formGroup}>
                <Text style={styles.label}>Notas (Opcional)</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    placeholder="Ej. Comida premium para el mes"
                    multiline
                    numberOfLines={3}
                />
            </View>

            <TouchableOpacity
                style={[styles.saveButton, addExpenseMutation.isPending && styles.disabledButton]}
                onPress={handleSave}
                disabled={addExpenseMutation.isPending}
            >
                {addExpenseMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Ionicons name="save-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.saveButtonText}>Guardar Gasto</Text>
                    </>
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
        padding: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 24,
    },
    formGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 12,
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#eee',
    },
    dateInput: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
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
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    petSelector: {
        flexDirection: 'row',
    },
    petChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    activePetChip: {
        backgroundColor: '#7c9a6b',
        borderColor: '#7c9a6b',
    },
    petChipText: {
        color: '#666',
        fontWeight: '500',
    },
    activePetChipText: {
        color: '#fff',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#eee',
    },
    activeCategoryChip: {
        backgroundColor: '#7c9a6b20',
        borderColor: '#7c9a6b',
    },
    categoryChipText: {
        color: '#666',
        fontSize: 13,
    },
    activeCategoryChipText: {
        color: '#7c9a6b',
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: '#7c9a6b',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
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
});
