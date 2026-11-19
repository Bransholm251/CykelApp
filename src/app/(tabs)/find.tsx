import React, { useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import { BikeViewer } from '@/components/BikeViewer';
import { GuideCard, SUGGESTION_CARD_WIDTH } from '@/components/GuideCard';
import { MechanicCard } from '@/components/MechanicCard';
import { T } from '@/components/ui';
import { useGuidesForPart, useParts, useTools } from '@/data/hooks';
import { useScreenReaderEnabled } from '@/hooks/useScreenReader';
import { colors, fonts, radius, TOUCH } from '@/theme';
import type { Guide } from '@/types';

const GAP = 12;
const DEFAULT_PART = 'tires';

type Item = { kind: 'guide'; guide: Guide } | { kind: 'mechanic' };

export default function FindProblemScreen() {
  const { data: parts = [] } = useParts();
  const [partId, setPartId] = useState(DEFAULT_PART);
  const [rotating, setRotating] = useState(false);
  const { data: guides = [] } = useGuidesForPart(partId);
  const toolIds = useMemo(() => [...new Set(guides.flatMap((g) => g.toolIds))], [guides]);
  const { data: tools = [] } = useTools(toolIds);
  const screenReader = useScreenReaderEnabled();
  const list = useRef<FlatList<Item>>(null);

  const part = parts.find((p) => p.id === partId);
  const items: Item[] = useMemo(() => [...guides.map((guide) => ({ kind: 'guide' as const, guide })), { kind: 'mechanic' as const }], [guides]);

  const select = (id: string) => {
    setPartId(id);
    list.current?.scrollToOffset({ offset: 0, animated: false });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView scrollEnabled={!rotating} contentContainerStyle={styles.content}>
        <T variant="h1" accessibilityRole="header">Hvor driller cyklen?</T>
        <T variant="body" style={styles.sub}>Tryk på den del, der giver problemer.</T>

        <View style={styles.viewerCard}>
          {parts.length ? (
            <BikeViewer parts={parts} selectedPartId={partId} onSelectPart={select} onRotatingChange={setRotating} />
          ) : (
            <View style={{ height: 270 }} />
          )}
        </View>

        {/* Alternativ til 3D-visningen for skærmlæsere */}
        {screenReader ? (
          <View accessibilityRole="list" accessibilityLabel="Cyklens dele" style={styles.srList}>
            {parts.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => select(p.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: p.id === partId }}
                accessibilityLabel={`${p.name}, ${p.guideIds.length} forslag`}
                style={[styles.srItem, p.id === partId && styles.srItemSelected]}
              >
                <T variant="bodyStrong" style={p.id === partId ? { color: colors.textOnDark } : undefined}>{p.name}</T>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.partRow} accessibilityLiveRegion="polite">
          <View style={{ flex: 1 }}>
            <T variant="h2" accessibilityRole="header">{part?.name ?? ''}</T>
            <T variant="small">{guides.length} forslag</T>
          </View>
          <View style={styles.swipe} accessibilityElementsHidden importantForAccessibility="no">
            <T variant="caption" style={{ fontFamily: fonts.semibold }}>Swipe</T>
            <ArrowRight size={14} color={colors.textSecondary} />
          </View>
        </View>

        <FlatList
          ref={list}
          data={items}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={SUGGESTION_CARD_WIDTH + GAP}
          snapToAlignment="start"
          decelerationRate="fast"
          style={styles.carousel}
          contentContainerStyle={styles.carouselContent}
          ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
          keyExtractor={(it) => (it.kind === 'guide' ? it.guide.id : 'mechanic')}
          renderItem={({ item }) =>
            item.kind === 'guide' ? (
              <GuideCard
                variant="suggestion"
                guide={item.guide}
                part={part}
                toolNames={item.guide.toolIds.map((id) => tools.find((t) => t.id === id)?.name).filter((n): n is string => Boolean(n))}
              />
            ) : (
              <MechanicCard
                style={{ width: SUGGESTION_CARD_WIDTH, minHeight: 268 }}
                title="Klarer du det ikke selv?"
                body="Find en cykelsmed i nærheden, der kan hjælpe dig."
                buttonLabel="Find cykelsmed"
              />
            )
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  sub: { color: colors.textSecondary, marginTop: 4 },
  viewerCard: { marginTop: 16, borderRadius: radius.cardLg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', backgroundColor: colors.surface },
  srList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  srItem: { minHeight: TOUCH, paddingHorizontal: 14, justifyContent: 'center', borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  srItemSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  partRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 20, marginBottom: 12 },
  carousel: { marginHorizontal: -20 },
  carouselContent: { paddingHorizontal: 20 },
  swipe: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingBottom: 2 },
});
