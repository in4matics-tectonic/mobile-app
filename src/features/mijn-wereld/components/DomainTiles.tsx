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
  return (
    <View style={styles.grid}>
      {tiles.map((tile) => (
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
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    flexBasis: '45%',
    flexGrow: 1,
    minWidth: 0,
    backgroundColor: world.card,
    borderRadius: 18,
    paddingVertical: 11,
    paddingHorizontal: 12,
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
  summary: { fontFamily: font.body600, fontSize: 12, lineHeight: 16.2, color: world.soft },
});
