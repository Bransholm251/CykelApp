import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ShoppingCart, Wrench } from 'lucide-react-native';
import type { Partner, Tool } from '@/types';
import { colors, fonts, radius } from '@/theme';
import { Button, T } from './ui';
import { formatPrice } from '@/lib/format';
import { openInApp } from '@/lib/links';

export function ToolCard({ tool, partners }: { tool: Tool; partners: Partner[] }) {
  const offers = [...tool.offers].sort((a, b) => a.price - b.price);
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.image} accessible={false}>
          {tool.imageUrl ? (
            <Image source={{ uri: tool.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityIgnoresInvertColors />
          ) : (
            <Wrench size={28} color={colors.textSecondary} strokeWidth={1.6} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <T variant="bodyStrong">{tool.name}</T>
          <T variant="small" style={{ marginTop: 2 }}>{tool.why}</T>
        </View>
      </View>
      {offers.map((offer) => {
        const partner = partners.find((p) => p.id === offer.partnerId);
        return (
          <View key={offer.partnerId} style={styles.offer}>
            <View style={{ flex: 1 }}>
              <T style={{ fontFamily: fonts.bold }}>{formatPrice(offer.price)}</T>
              <T variant="caption">hos {partner?.name ?? 'partner'}</T>
            </View>
            <Button
              label="Køb"
              compact
              kind="dark"
              icon={<ShoppingCart size={16} color={colors.textOnDark} />}
              onPress={() => openInApp(offer.url)}
              accessibilityLabel={`Køb ${tool.name} hos ${partner?.name ?? 'partner'} for ${formatPrice(offer.price)}`}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 10 },
  top: { flexDirection: 'row', gap: 12 },
  image: { width: 64, height: 64, borderRadius: 14, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  offer: { flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
});
