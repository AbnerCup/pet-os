import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BottomTabBar, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Componente de barra de tabs que respeta el area segura del dispositivo
 * Especialmente util para Android con botones de navegacion en la parte inferior
 */
export function SafeBottomTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container,
      {
        paddingBottom: insets.bottom,
      }
    ]}>
      <BottomTabBar {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e5e5',
    // Sombra para dar profundidad
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});

export default SafeBottomTabBar;
