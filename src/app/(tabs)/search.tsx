import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import { GuideCard } from '@/components/GuideCard';
import { T } from '@/components/ui';
import { useGuides, useParts } from '@/data/hooks';
import { sameTerm, searchGuides } from '@/lib/search';
import { colors, fonts, radius, TOUCH } from '@/theme';

const CHIPS = ['Punktering', 'Kæde', 'Bremser', 'Gear', 'Lys'];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const { data: guides = [] } = useGuides();
  const { data: parts = [] } = useParts();

  const items = useMemo(() => guides.map((guide) => ({ guide, part: parts.find((p) => p.id === guide.partId) })), [guides, parts]);
  const results = useMemo(() => searchGuides(items, query), [items, query]);
  const trimmed = query.trim();

  const header = (
    <View>
      <T variant="h1" accessibilityRole="header">Søg efter problem</T>
      <View style={styles.inputWrap}>
        <Search size={20} color={colors.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Fx punktering, kæde, bremser…"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel="Søg efter problem"
          clearButtonMode="never"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Ryd søgning" style={styles.clear}>
            <X size={18} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.chips}>
        {CHIPS.map((chip) => {
          const active = sameTerm(chip, query);
          return (
            <Pressable
              key={chip}
              onPress={() => setQuery(active ? '' : chip)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={active ? `${chip}, valgt. Tryk for at fravælge` : chip}
              style={[styles.chip, active && styles.chipActive]}
            >
              <T style={[styles.chipText, active && { color: '#FFFFFF' }]}>{chip}</T>
            </Pressable>
          );
        })}
      </View>

      <T variant="label" style={styles.count} accessibilityLiveRegion="polite">
        {trimmed ? `${results.length} ${results.length === 1 ? 'resultat' : 'resultater'} for '${trimmed}'` : 'Alle guides'}
      </T>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={results}
        keyExtractor={(it) => it.guide.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.content}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => <GuideCard variant="row" guide={item.guide} part={item.part} />}
        ListEmptyComponent={
          guides.length ? (
            <View style={styles.empty}>
              <T variant="h3" style={{ textAlign: 'center' }}>Ingen guides matcher din søgning</T>
              <T variant="small" style={{ textAlign: 'center', marginTop: 6 }}>Prøv et andet ord – eller find problemet direkte på cyklen.</T>
              <Pressable onPress={() => router.navigate('/find')} accessibilityRole="link" style={styles.emptyLink}>
                <T style={{ color: colors.accent, fontFamily: fonts.semibold }}>Gå til Find problem</T>
              </Pressable>
            </View>
          ) : undefined
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    paddingLeft: 16,
    paddingRight: 4,
    minHeight: 56,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { flex: 1, fontFamily: fonts.body, fontSize: 17, color: colors.text, paddingVertical: 14 },
  clear: { width: TOUCH, height: TOUCH, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  chip: {
    minHeight: TOUCH,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  count: { marginTop: 22, marginBottom: 10 },
  empty: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 12 },
  emptyLink: { minHeight: TOUCH, justifyContent: 'center', marginTop: 8 },
});
