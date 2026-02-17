import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  // Espacio adicional para la barra de tabs (default: 80)
  bottomPadding?: number;
  // Si es true, aplica padding top basado en safe area
  applyTopPadding?: boolean;
}

/**
 * Wrapper que asegura que el contenido no quede debajo de elementos del sistema
 * como la barra de navegacion inferior o la barra de estado superior
 */
export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  style,
  bottomPadding = 80, // Espacio para la barra de tabs + margen
  applyTopPadding = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: applyTopPadding ? insets.top : 0,
          paddingBottom: bottomPadding + insets.bottom,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeAreaWrapper;
