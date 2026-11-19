import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors, TOUCH } from '@/theme';

interface Props {
  value: number;
  onChange?: (score: 1 | 2 | 3 | 4 | 5) => void;
  size?: number;
}

/** Trykbare stjerner når onChange er sat, ellers kun visning. */
export function StarRating({ value, onChange, size = 30 }: Props) {
  const stars = [1, 2, 3, 4, 5] as const;
  if (!onChange) {
    return (
      <View style={styles.row} accessible accessibilityLabel={`${value} af 5 stjerner`}>
        {stars.map((n) => (
          <Star key={n} size={size} color={colors.accent} fill={n <= value ? colors.accent : 'transparent'} strokeWidth={1.8} />
        ))}
      </View>
    );
  }
  return (
    <View style={styles.row} accessibilityRole="adjustable" accessibilityLabel="Bedømmelse" accessibilityValue={{ min: 0, max: 5, now: value }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => {
        const next = e.nativeEvent.actionName === 'increment' ? Math.min(5, value + 1) : Math.max(1, value - 1);
        onChange(next as 1 | 2 | 3 | 4 | 5);
      }}
    >
      {stars.map((n) => (
        <Pressable
          key={n}
          onPress={() => onChange(n)}
          accessibilityRole="button"
          accessibilityLabel={`Giv ${n} af 5 stjerner`}
          accessibilityState={{ selected: n <= value }}
          hitSlop={4}
          style={({ pressed }) => [styles.touch, pressed && { transform: [{ scale: 0.9 }] }]}
        >
          <Star size={size} color={colors.accent} fill={n <= value ? colors.accent : 'transparent'} strokeWidth={1.8} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  touch: { minWidth: TOUCH, minHeight: TOUCH, alignItems: 'center', justifyContent: 'center' },
});
