import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BookmarkX, Settings } from 'lucide-react-native';
import { Card, T } from '@/components/ui';
import { GuideCard } from '@/components/GuideCard';
import { StarRating } from '@/components/StarRating';
import { useGuides, useParts } from '@/data/hooks';
import { useUserData } from '@/data/UserDataProvider';
import { formatDate, initials } from '@/lib/format';
import { colors, fonts, radius, TOUCH } from '@/theme';

type Tab = 'saved' | 'ratings';

export default function ProfileScreen() {
  const [tab, setTab] = useState<Tab>('saved');
  const user = useUserData();
  const { data: guides = [] } = useGuides();
  const { data: parts = [] } = useParts();
  const name = user.profile?.name ?? 'Gæst';

  const savedGuides = user.saved.flatMap((s) => {
    const g = guides.find((x) => x.id === s.guideId);
    return g ? [g] : [];
  });
  const rated = user.ratings.flatMap((r) => {
    const g = guides.find((x) => x.id === r.guideId);
    return g ? [{ rating: r, guide: g }] : [];
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <T variant="h1" style={{ flex: 1 }} accessibilityRole="header">Profil</T>
          <Pressable
            onPress={() => Alert.alert('Indstillinger', 'Indstillinger kommer i en senere version.')}
            accessibilityRole="button"
            accessibilityLabel="Indstillinger"
            style={styles.iconBtn}
          >
            <Settings size={22} color={colors.text} />
          </Pressable>
        </View>

        <Card style={styles.profile}>
          <View style={styles.avatar}>
            <T style={styles.avatarText}>{initials(name)}</T>
          </View>
          <View style={{ flex: 1 }}>
            <T variant="h3">{name}</T>
            <T variant="small">
              {user.saved.length} {user.saved.length === 1 ? 'gemt guide' : 'gemte guides'} · {user.ratings.length}{' '}
              {user.ratings.length === 1 ? 'rating' : 'ratings'} givet
            </T>
            <T variant="caption" style={{ marginTop: 2 }}>Gæsteprofil – gemt på denne enhed</T>
          </View>
        </Card>

        <View style={styles.segment} accessibilityRole="tablist">
          {([
            ['saved', 'Gemte guides'],
            ['ratings', 'Mine ratings'],
          ] as const).map(([key, label]) => {
            const active = tab === key;
            return (
              <Pressable
                key={key}
                onPress={() => setTab(key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={[styles.segBtn, active && styles.segBtnActive]}
              >
                <T style={[styles.segText, active && { color: colors.text }]}>{label}</T>
              </Pressable>
            );
          })}
        </View>

        {tab === 'saved' ? (
          savedGuides.length ? (
            <View style={{ gap: 10 }}>
              {savedGuides.map((g) => (
                <GuideCard
                  key={g.id}
                  variant="row"
                  guide={g}
                  part={parts.find((p) => p.id === g.partId)}
                  right={
                    <Pressable
                      onPress={() => user.toggleSaved(g.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Fjern ${g.title} fra gemte`}
                      style={styles.removeBtn}
                    >
                      <BookmarkX size={20} color={colors.accent} />
                    </Pressable>
                  }
                />
              ))}
            </View>
          ) : (
            <Empty title="Ingen gemte guides endnu" body="Tryk på 'Gem' øverst i en guide for at finde den hurtigt her næste gang." />
          )
        ) : rated.length ? (
          <View style={{ gap: 10 }}>
            {rated.map(({ rating, guide }) => {
              const part = parts.find((p) => p.id === guide.partId);
              return (
                <Pressable
                  key={guide.id}
                  onPress={() => router.push({ pathname: '/guide/[id]', params: { id: guide.id } })}
                  accessibilityRole="button"
                  accessibilityLabel={`${guide.title}. Du gav ${rating.score} af 5 den ${formatDate(rating.createdAt)}. ${rating.comment ?? ''} Tryk for at ændre.`}
                  style={({ pressed }) => [styles.ratingCard, pressed && { opacity: 0.75 }]}
                >
                  <T variant="caption">{part ? `${part.name} · ` : ''}{guide.problem}</T>
                  <T variant="bodyStrong" style={{ marginTop: 2 }}>{guide.title}</T>
                  <View style={styles.ratingRow}>
                    <StarRating value={rating.score} size={16} />
                    <T variant="caption">{formatDate(rating.createdAt)}</T>
                  </View>
                  {rating.comment ? <T variant="small" style={{ marginTop: 6, fontStyle: 'italic' }}>"{rating.comment}"</T> : null}
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Empty title="Du har ikke bedømt nogen guides endnu" body="Når du har fulgt en guide, kan du give den stjerner nederst på siden." />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <Card style={{ padding: 22, alignItems: 'center' }}>
      <T variant="h3" style={{ textAlign: 'center' }}>{title}</T>
      <T variant="small" style={{ textAlign: 'center', marginTop: 6 }}>{body}</T>
      <Pressable onPress={() => router.navigate('/find')} accessibilityRole="link" style={{ minHeight: TOUCH, justifyContent: 'center', marginTop: 4 }}>
        <T style={{ color: colors.accent, fontFamily: fonts.semibold }}>Find en guide</T>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: TOUCH, height: TOUCH, borderRadius: TOUCH / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, marginTop: 16 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.heading, fontSize: 20, color: '#FFFFFF' },
  segment: { flexDirection: 'row', backgroundColor: '#E7ECE8', borderRadius: 14, padding: 4, marginTop: 20, marginBottom: 14 },
  segBtn: { flex: 1, minHeight: TOUCH, alignItems: 'center', justifyContent: 'center', borderRadius: 11 },
  segBtnActive: { backgroundColor: colors.card, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  segText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.textSecondary },
  removeBtn: { width: TOUCH, height: TOUCH, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  ratingCard: { backgroundColor: colors.card, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: 16 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
});
