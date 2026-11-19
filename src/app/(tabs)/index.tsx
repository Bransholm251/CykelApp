import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Bike, ChevronRight, Search, ScanSearch, User } from 'lucide-react-native';
import { Button, Card, SectionHeader, T } from '@/components/ui';
import { GuideCard } from '@/components/GuideCard';
import { useParts, usePartners, usePopularGuides } from '@/data/hooks';
import { APP_NAME, COMPANY_NAME, CONTACT_EMAIL, PARTNER_SIGNUP_URL } from '@/config';
import { openInApp } from '@/lib/links';
import { initials } from '@/lib/format';
import { colors, fonts, radius, TOUCH } from '@/theme';

const STEPS = [
  { title: 'Find problemet', body: 'Tryk på delen på 3D-cyklen, eller søg efter problemet.' },
  { title: 'Vælg en løsning', body: 'Se forslag sorteret efter del – med sværhedsgrad og tid.' },
  { title: 'Følg guiden', body: 'Trin for trin, med det rigtige værktøj fra vores partnere.' },
];

export default function HomeScreen() {
  const { data: popular = [] } = usePopularGuides();
  const { data: parts = [] } = useParts();
  const { data: partners = [] } = usePartners();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo} accessibilityElementsHidden importantForAccessibility="no">
            <Bike size={22} color={colors.textOnDark} strokeWidth={2} />
          </View>
          <T variant="h3" style={{ flex: 1, fontSize: 20 }} accessibilityRole="header">{APP_NAME}</T>
          <Pressable
            onPress={() => router.navigate('/profile')}
            accessibilityRole="button"
            accessibilityLabel="Gå til profil"
            style={styles.iconButton}
          >
            <User size={22} color={colors.text} />
          </Pressable>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <T variant="h1" style={{ color: colors.textOnDark }}>Fiks cyklen selv – trin for trin</T>
          <T variant="body" style={{ color: colors.textOnDarkMuted, marginTop: 8 }}>
            Spar turen til cykelhandleren. Find fejlen, følg en enkel guide, og få det rigtige værktøj anbefalet.
          </T>
          <View style={styles.heroButtons}>
            <Button
              label="Find problemet"
              icon={<ScanSearch size={18} color={colors.textOnDark} />}
              onPress={() => router.navigate('/find')}
              style={{ flex: 1 }}
            />
            <Button
              label="Søg"
              kind="onBrand"
              icon={<Search size={18} color={colors.textOnDark} />}
              onPress={() => router.navigate('/search')}
              style={{ flex: 1 }}
            />
          </View>
        </View>

        {/* Sådan virker det */}
        <View style={styles.section}>
          <SectionHeader title="Sådan virker det" />
          <Card style={{ padding: 16, gap: 16 }}>
            {STEPS.map((s, i) => (
              <View key={s.title} style={styles.step}>
                <View style={styles.stepNum}>
                  <T style={styles.stepNumText}>{i + 1}</T>
                </View>
                <View style={{ flex: 1 }}>
                  <T variant="bodyStrong">{s.title}</T>
                  <T variant="small">{s.body}</T>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Partnere */}
        <View style={styles.section}>
          <Card style={{ padding: 18 }}>
            <T variant="label" style={{ color: colors.primary }}>Partnerbutikker</T>
            <T variant="h2" style={{ marginTop: 6 }}>Det rigtige værktøj til hver reparation</T>
            <T variant="small" style={{ marginTop: 6 }}>
              Hver guide anbefaler det værktøj, du skal bruge – udvalgt sammen med vores partnerbutikker – og viser, hvor du kan købe det.
            </T>
            <View style={styles.partners} accessibilityLabel={`Partnere: ${partners.map((p) => p.name).join(', ')}`} accessible>
              {partners.map((p) => (
                <View key={p.id} style={styles.partnerLogo}>
                  <View style={styles.partnerMark}>
                    <T style={styles.partnerMarkText}>{initials(p.name.replace('&', ''))}</T>
                  </View>
                  <T variant="caption" numberOfLines={1} style={{ color: colors.text }}>{p.name}</T>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Populære reparationer */}
        <View style={styles.section}>
          <SectionHeader
            title="Populære reparationer"
            right={
              <Pressable onPress={() => router.navigate('/search')} accessibilityRole="link" style={styles.seeAll} hitSlop={8}>
                <T variant="small" style={{ color: colors.accent, fontFamily: fonts.semibold }}>Se alle</T>
                <ChevronRight size={16} color={colors.accent} />
              </Pressable>
            }
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
            {popular.map((g) => (
              <GuideCard key={g.id} variant="compact" guide={g} part={parts.find((p) => p.id === g.partId)} />
            ))}
          </ScrollView>
        </View>

        {/* Om */}
        <View style={styles.section}>
          <SectionHeader title={`Om ${COMPANY_NAME}`} />
          <T variant="body" style={{ color: colors.textSecondary }}>
            Vi tror på, at de fleste kan klare de små reparationer selv. {APP_NAME} samler enkle, gennemprøvede guides og
            samarbejder med lokale cykelbutikker, så du altid ved, hvilket værktøj du skal bruge – og hvor du får fat i det.
          </T>
          <View style={styles.links}>
            <Button kind="secondary" label="Kontakt os" onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)} style={{ flex: 1 }} />
            <Button kind="secondary" label="Bliv partnerbutik" onPress={() => openInApp(PARTNER_SIGNUP_URL)} style={{ flex: 1 }} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  logo: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  iconButton: {
    width: TOUCH,
    height: TOUCH,
    borderRadius: TOUCH / 2,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: { backgroundColor: colors.primary, borderRadius: radius.cardLg, padding: 20, marginTop: 12 },
  heroButtons: { flexDirection: 'row', gap: 10, marginTop: 20 },
  section: { marginTop: 28 },
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontFamily: fonts.heading, color: colors.textOnDark, fontSize: 15 },
  partners: { flexDirection: 'row', gap: 10, marginTop: 16 },
  partnerLogo: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border },
  partnerMark: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  partnerMarkText: { fontFamily: fonts.heading, color: colors.primary, fontSize: 14 },
  seeAll: { flexDirection: 'row', alignItems: 'center', minHeight: TOUCH },
  links: { flexDirection: 'row', gap: 10, marginTop: 16 },
});
