import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight, Store, Wrench } from 'lucide-react-native';
import type { Guide, Part } from '@/types';
import { colors, fonts, radius } from '@/theme';
import { Button, LevelBadge, T, TimeBadge } from './ui';
import { formatMinutes } from '@/lib/format';

export const SUGGESTION_CARD_WIDTH = 248;

const openGuide = (id: string) => router.push({ pathname: '/guide/[id]', params: { id } });

interface Props {
  guide: Guide;
  part?: Part;
  /** suggestion = forslagskort på Find problem, compact = lille kort i vandret række, row = listeelement. */
  variant: 'suggestion' | 'compact' | 'row';
  toolNames?: string[];
  right?: React.ReactNode;
}

export function GuideCard({ guide, part, variant, toolNames = [], right }: Props) {
  if (variant === 'suggestion') {
    return (
      <View style={[styles.base, styles.suggestion]}>
        <View style={styles.badges}>
          <LevelBadge level={guide.level} />
          <TimeBadge minutes={guide.minutes} />
        </View>
        <T variant="caption" style={{ marginTop: 12 }}>{guide.problem}</T>
        <T variant="h3" style={{ marginTop: 2 }} numberOfLines={2}>{guide.title}</T>
        <View style={styles.flex} />
        <View style={styles.infoRow}>
          <Wrench size={15} color={colors.textSecondary} />
          <T variant="small" style={styles.flex} numberOfLines={2}>
            {toolNames.length ? toolNames.join(', ') : 'Intet særligt værktøj'}
          </T>
        </View>
        {toolNames.length ? (
          <View style={styles.infoRow}>
            <Store size={15} color={colors.primary} />
            <T variant="small" style={{ color: colors.primary, fontFamily: fonts.medium }}>Værktøj kan købes hos partner</T>
          </View>
        ) : null}
        <Button
          label="Se guide"
          onPress={() => openGuide(guide.id)}
          accessibilityLabel={`Se guide: ${guide.title}`}
          style={{ marginTop: 12 }}
        />
      </View>
    );
  }

  if (variant === 'compact') {
    return (
      <Pressable
        onPress={() => openGuide(guide.id)}
        accessibilityRole="button"
        accessibilityLabel={`${guide.title}. ${part?.name ?? ''}, ${guide.problem}. ${guide.level}, ${guide.minutes} minutter`}
        style={({ pressed }) => [styles.base, styles.compact, pressed && styles.pressed]}
      >
        <T variant="caption" numberOfLines={1}>{part?.name}</T>
        <T variant="h3" style={{ marginTop: 4, fontSize: 16 }} numberOfLines={2}>{guide.title}</T>
        <View style={styles.flex} />
        <View style={[styles.badges, { marginTop: 10 }]}>
          <LevelBadge level={guide.level} />
          <TimeBadge minutes={guide.minutes} />
        </View>
      </Pressable>
    );
  }

  return (
    <View style={[styles.base, styles.row]}>
      <Pressable
        onPress={() => openGuide(guide.id)}
        accessibilityRole="button"
        accessibilityLabel={`${guide.title}. ${part?.name ?? ''}, ${guide.problem}. ${guide.level}, ${guide.minutes} minutter`}
        style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}
      >
        <View style={styles.flex}>
          <T variant="caption" numberOfLines={1}>
            {part ? `${part.name} · ` : ''}{guide.problem}
          </T>
          <T variant="bodyStrong" style={{ marginTop: 2 }}>{guide.title}</T>
          <T variant="small" style={{ marginTop: 2 }}>
            <T variant="small" style={{ color: guide.level === 'Let' ? colors.levelEasyText : colors.levelMediumText, fontFamily: fonts.semibold }}>
              {guide.level}
            </T>
            {` · ${formatMinutes(guide.minutes)}`}
          </T>
        </View>
        {right ? null : <ChevronRight size={20} color={colors.textSecondary} />}
      </Pressable>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  base: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border },
  pressed: { opacity: 0.75 },
  badges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  suggestion: { width: SUGGESTION_CARD_WIDTH, padding: 16, minHeight: 268 },
  infoRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 8 },
  compact: { width: 168, minHeight: 136, padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', paddingRight: 4 },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, paddingLeft: 16, paddingRight: 12, minHeight: 64 },
});
