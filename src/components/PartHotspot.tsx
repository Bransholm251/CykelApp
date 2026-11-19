import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, TOUCH } from '@/theme';

interface Props {
  label: string;
  x: number;
  y: number;
  selected: boolean;
  /** Delen er på den bortvendte side af cyklen. */
  behind?: boolean;
  onPress(): void;
}

/** Markør oven på 3D-visningen. Touch-målet er 44 px, prikken er 16 px. */
export function PartHotspot({ label, x, y, selected, behind, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={`Viser forslag til ${label.toLowerCase()}`}
      accessibilityState={{ selected }}
      style={[styles.touch, { left: x - TOUCH / 2, top: y - TOUCH / 2, opacity: behind && !selected ? 0.55 : 1 }]}
    >
      {selected ? <View style={styles.halo} /> : null}
      <View style={[styles.dot, selected && styles.dotSelected]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  touch: { position: 'absolute', width: TOUCH, height: TOUCH, alignItems: 'center', justifyContent: 'center' },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: colors.accent,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  dotSelected: { backgroundColor: colors.accent, borderColor: '#FFFFFF', width: 18, height: 18, borderRadius: 9 },
  halo: { position: 'absolute', width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(194,65,12,0.22)' },
});
