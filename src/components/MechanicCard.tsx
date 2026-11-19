import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { colors, radius } from '@/theme';
import { Button, T } from './ui';
import { findMechanic } from '@/lib/links';

/** Mørk boks der henviser til en cykelsmed. */
export function MechanicCard({ title, body, buttonLabel, style }: { title: string; body?: string; buttonLabel: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.box, style]}>
      <View style={styles.icon}>
        <MapPin size={20} color={colors.onDark} />
      </View>
      <T variant="h3" style={{ color: colors.onDark, marginTop: 12 }}>{title}</T>
      {body ? <T variant="small" style={{ color: colors.onDarkSecondary, marginTop: 4 }}>{body}</T> : null}
      <View style={{ flex: 1 }} />
      <Button kind="onDark" label={buttonLabel} onPress={findMechanic} style={{ marginTop: 16 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.dark, borderRadius: radius.cardLg, padding: 18 },
  icon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
});
