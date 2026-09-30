// 2×2 grid of life domains with a status chip.

import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Domain, DomainInfo } from '../state/types';
import { font, shadow, world } from '../theme';
import { Chip } from './ui';

export function DomainTiles({
  tiles,
  onOpen,
}: {
  tiles: DomainInfo[];
  onOpen: (domain: Domain) => void;
}) {
  // Rows of two equal columns, like the prototype's `grid-template-columns: 1fr 1fr`.
  const rows: DomainInfo[][] = [];
  for (let i = 0; i < tiles.length; i += 2) rows.push(tiles.slice(i, i + 2));

  return (
    <View style={styles.grid}>
      {rows.map((row) => (
        <View key={row[0].id} style={styles.row}>
          {row.map((tile) => (
            <Pressable
              key={tile.id}
              role="button"
              aria-label={`${tile.title}: ${tile.chip?.label ?? ''}, ${tile.summary}`}
              onPress={() => onOpen(tile.id)}
              style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
              <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={1}>
                  {tile.title}
                </Text>
                {tile.chip && <Chip tone={tile.chip.tone}>{tile.chip.label}</Chip>}
              </View>
              <Text style={styles.summary}>{tile.summary}</Text>
            </Pressable>
          ))}
          {row.length === 1 && <View style={styles.spacer} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
  spacer: { flex: 1 },
  tile: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
    backgroundColor: world.card,
    borderRadius: 18,
    paddingVertical: 11,
    // 10px (prototype: 12) so 'Woonkrediet · nog 23 jaar' stays on one line with the native Nunito metrics.
    paddingHorizontal: 10,
    gap: 2,
    boxShadow: shadow.tile,
  },
  pressed: { transform: [{ translateY: 2 }] },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  title: { fontFamily: font.display600, fontSize: 15, color: world.ink, flexShrink: 1 },
  summary: { fontFamily: font.body600, fontSize: 12, lineHeight: 16.2, letterSpacing: -0.1, color: world.soft },
});
