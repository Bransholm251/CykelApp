import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Bookmark, BookmarkCheck, ChevronLeft, MapPin, Play } from 'lucide-react-native';
import { Button, Card, LevelBadge, RatingBadge, SectionHeader, T, TimeBadge } from '@/components/ui';
import { ToolCard } from '@/components/ToolCard';
import { StarRating } from '@/components/StarRating';
import { MechanicCard } from '@/components/MechanicCard';
import { useGuide, useParts, usePartners, useTools } from '@/data/hooks';
import { displayRating, useUserData } from '@/data/UserDataProvider';
import { colors, fonts, radius, TOUCH } from '@/theme';
import type { Rating } from '@/types';

export default function GuideScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: guide, loading } = useGuide(id);
  const { data: parts = [] } = useParts();
  const { data: tools = [] } = useTools(guide?.toolIds ?? []);
  const { data: partners = [] } = usePartners();
  const user = useUserData();

  const own = user.getRating(id);
  const [justRated, setJustRated] = useState(false);
  const [comment, setComment] = useState(own?.comment ?? '');
  useEffect(() => setComment(own?.comment ?? ''), [own?.comment]);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!guide) {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar onBack={back} />
        {!loading ? <T style={{ padding: 20 }}>Guiden blev ikke fundet.</T> : null}
      </SafeAreaView>
    );
  }

  const part = parts.find((p) => p.id === guide.partId);
  const saved = user.isSaved(guide.id);
  const rating = displayRating(guide, own);

  const onRate = (score: Rating['score']) => {
    user.rate(guide.id, score, comment);
    setJustRated(true);
  };
  const commentChanged = (own?.comment ?? '') !== comment.trim();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar
        onBack={back}
        right={
          <Pressable
            onPress={() => user.toggleSaved(guide.id)}
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Fjern fra gemte guides' : 'Gem guide'}
            accessibilityState={{ selected: saved }}
            style={[styles.saveBtn, saved && styles.saveBtnActive]}
          >
            {saved ? <BookmarkCheck size={18} color={colors.textOnDark} /> : <Bookmark size={18} color={colors.text} />}
            <T style={[styles.saveText, saved && { color: colors.textOnDark }]}>{saved ? 'Gemt' : 'Gem'}</T>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content} automaticallyAdjustKeyboardInsets keyboardShouldPersistTaps="handled">
        <T variant="caption">{part ? `${part.name} · ` : ''}{guide.problem}</T>
        <T variant="h1" style={{ marginTop: 4 }} accessibilityRole="header">{guide.title}</T>
        <View style={styles.badges}>
          <LevelBadge level={guide.level} />
          <TimeBadge minutes={guide.minutes} />
          <RatingBadge avg={rating.avg} count={rating.count} />
        </View>

        {/* Pladsholder til video/animation */}
        <View style={styles.media} accessible accessibilityLabel="Video til guiden kommer snart">
          <View style={styles.play}>
            <Play size={26} color={colors.textOnDark} fill={colors.textOnDark} />
          </View>
          <T variant="small" style={{ marginTop: 10 }}>Video kommer snart</T>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Trin for trin" />
          <Card style={{ padding: 16, gap: 14 }}>
            {guide.steps.map((step, i) => (
              <View key={i} style={styles.step} accessible accessibilityLabel={`Trin ${i + 1}: ${step}`}>
                <View style={styles.stepNum}>
                  <T style={styles.stepNumText}>{i + 1}</T>
                </View>
                <T variant="body" style={{ flex: 1 }}>{step}</T>
              </View>
            ))}
          </Card>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Anbefalet værktøj" subtitle="Udvalgt i samarbejde med vores partnerbutikker" />
          {tools.length ? (
            <View style={{ gap: 12 }}>
              {tools.map((t) => (
                <ToolCard key={t.id} tool={t} partners={partners} />
              ))}
            </View>
          ) : (
            <Card style={{ padding: 16 }}>
              <T variant="small">Du skal ikke bruge særligt værktøj til denne reparation.</T>
            </Card>
          )}
          <Button
            kind="secondary"
            label="Find butik tæt på mig"
            icon={<MapPin size={18} color={colors.text} />}
            onPress={() => Alert.alert('Kommer snart', 'Snart kan du se partnerbutikker i nærheden af dig.')}
            style={{ marginTop: 12 }}
          />
        </View>

        <View style={styles.section}>
          <Card style={{ padding: 18 }}>
            <T variant="h2" accessibilityRole="header">Hjalp guiden dig?</T>
            <View style={{ marginTop: 8, marginLeft: -8 }}>
              <StarRating value={own?.score ?? 0} onChange={onRate} />
            </View>
            {own && justRated ? (
              <T variant="small" style={styles.thanks} accessibilityLiveRegion="polite">
                Tak! Du gav {own.score} af 5 – vises på din profil
              </T>
            ) : own ? (
              <T variant="small" style={{ marginTop: 6 }}>Din bedømmelse: {own.score} af 5. Tryk på en stjerne for at ændre.</T>
            ) : null}
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Valgfri kommentar (fx hvad der drillede)"
              placeholderTextColor={colors.textSecondary}
              style={styles.comment}
              multiline
              maxLength={280}
              accessibilityLabel="Valgfri kommentar"
            />
            {own && commentChanged ? (
              <Button label="Gem kommentar" compact onPress={() => user.rate(guide.id, own.score, comment)} style={{ marginTop: 10, alignSelf: 'flex-start' }} />
            ) : !own && comment.trim() ? (
              <T variant="caption" style={{ marginTop: 8 }}>Vælg antal stjerner for at gemme din kommentar.</T>
            ) : null}
          </Card>
        </View>

        <MechanicCard style={styles.section} title="Gik det ikke?" body="Book en cykelsmed i nærheden" buttonLabel="Find smed" />
      </ScrollView>
    </SafeAreaView>
  );
}

function TopBar({ onBack, right }: { onBack(): void; right?: React.ReactNode }) {
  return (
    <View style={styles.topbar}>
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Tilbage" style={styles.backBtn} hitSlop={6}>
        <ChevronLeft size={22} color={colors.text} />
        <T style={{ fontFamily: fonts.semibold }}>Tilbage</T>
      </Pressable>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 4 },
  backBtn: { flexDirection: 'row', alignItems: 'center', minHeight: TOUCH, paddingRight: 12 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: TOUCH,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  saveBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  saveText: { fontFamily: fonts.semibold, fontSize: 14 },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  badges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 12 },
  media: {
    marginTop: 18,
    height: 190,
    borderRadius: radius.cardLg,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  play: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingLeft: 4 },
  section: { marginTop: 28 },
  step: { flexDirection: 'row', gap: 12 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginTop: -2 },
  stepNumText: { fontFamily: fonts.heading, color: colors.textOnDark, fontSize: 14 },
  thanks: { marginTop: 6, color: colors.levelEasyText, fontFamily: fonts.semibold },
  comment: {
    marginTop: 14,
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
    textAlignVertical: 'top',
    backgroundColor: colors.background,
  },
});
