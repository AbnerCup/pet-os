import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const AddHealthRecordScreen = () => (
    <View style={styles.container}><Text style={styles.text}>Agregar Registro de Salud</Text></View>
);

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: { fontSize: 20, fontWeight: 'bold' }
});
