import React from 'react';
import { Pressable, StyleSheet, Text, TextProps, View, ViewStyle, StyleProp, PressableProps } from 'react-native';
import { Clock, Star } from 'lucide-react-native';
import { colors, fonts, radius, TOUCH } from '@/theme';
import type { Level } from '@/types';
import { formatMinutes, formatRating } from '@/lib/format';

type Variant = 'h1' | 'h2' | 'h3' | 'body' | 'bodyStrong' | 'small' | 'caption' | 'label';

export function T({ variant = 'body', style, ...rest }: TextProps & { variant?: Variant }) {
  return <Text {...rest} style={[textStyles[variant], style]} />;
}

const textStyles = StyleSheet.create({
  h1: { fontFamily: fonts.heading, fontSize: 28, lineHeight: 33, color: colors.text, letterSpacing: -0.5 },
  h2: { fontFamily: fonts.heading, fontSize: 21, lineHeight: 26, color: colors.text, letterSpacing: -0.3 },
  h3: { fontFamily: fonts.heading, fontSize: 17, lineHeight: 22, color: colors.text },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.text },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22, color: colors.text },
  small: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, color: colors.textSecondary },
  label: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, color: colors.textSecondary, letterSpacing: 0.6, textTransform: 'uppercase' },
});

export function Card({ style, children }: { style?: StyleProp<ViewStyle>; children: React.ReactNode }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type ButtonKind = 'primary' | 'dark' | 'secondary' | 'onBrand' | 'onDark' | 'ghost';

export function Button({
  label,
  kind = 'primary',
  icon,
  style,
  compact,
  ...rest
}: Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  kind?: ButtonKind;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}) {
  const k = buttonKinds[kind];
  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      style={({ pressed }) => [styles.button, compact && styles.buttonCompact, k.box, pressed && (kind === 'primary' ? { backgroundColor: colors.accentPressed } : { opacity: 0.8 }), style]}
    >
      {icon}
      <Text style={[styles.buttonText, { color: k.text }]}>{label}</Text>
    </Pressable>
  );
}

const buttonKinds: Record<ButtonKind, { box: ViewStyle; text: string }> = {
  primary: { box: { backgroundColor: colors.accent }, text: colors.textOnDark },
  dark: { box: { backgroundColor: colors.primary }, text: colors.textOnDark },
  secondary: { box: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, text: colors.text },
  onBrand: { box: { backgroundColor: colors.overlayOnDark, borderWidth: 1, borderColor: colors.overlayOnDarkBorder }, text: colors.textOnDark },
  onDark: { box: { backgroundColor: colors.surface }, text: colors.text },
  ghost: { box: { backgroundColor: 'transparent' }, text: colors.accent },
};

export function LevelBadge({ level }: { level: Level }) {
  const c =
    level === 'Let'
      ? { bg: colors.levelEasyBg, fg: colors.levelEasyText }
      : level === 'Mellem'
        ? { bg: colors.levelMediumBg, fg: colors.levelMediumText }
        : { bg: colors.levelHardBg, fg: colors.levelHardText };
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]} accessibilityLabel={`Sværhedsgrad: ${level}`}>
      <Text style={[styles.badgeText, { color: c.fg }]}>{level}</Text>
    </View>
  );
}

export function TimeBadge({ minutes }: { minutes: number }) {
  return (
    <View style={[styles.badge, styles.neutralBadge]} accessibilityLabel={`Tid: ${minutes} minutter`}>
      <Clock size={13} color={colors.textSecondary} strokeWidth={2} />
      <Text style={[styles.badgeText, { color: colors.textSecondary }]}>{formatMinutes(minutes)}</Text>
    </View>
  );
}

export function RatingBadge({ avg, count }: { avg: number; count: number }) {
  return (
    <View style={[styles.badge, styles.neutralBadge]} accessibilityLabel={`Gennemsnitlig bedømmelse ${formatRating(avg)} af 5, ${count} bedømmelser`}>
      <Star size={13} color={colors.accent} fill={colors.accent} strokeWidth={2} />
      <Text style={[styles.badgeText, { color: colors.text }]}>
        {formatRating(avg)} <Text style={{ color: colors.textSecondary }}>({count})</Text>
      </Text>
    </View>
  );
}

export function SectionHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <T variant="h2" accessibilityRole="header">
          {title}
        </T>
        {subtitle ? <T variant="small" style={{ marginTop: 4 }}>{subtitle}</T> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border },
  button: {
    minHeight: TOUCH,
    paddingHorizontal: 18,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonCompact: { paddingHorizontal: 14, borderRadius: 12 },
  buttonText: { fontFamily: fonts.semibold, fontSize: 15 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  neutralBadge: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  badgeText: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginBottom: 12 },
});
