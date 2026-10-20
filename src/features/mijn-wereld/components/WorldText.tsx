// "Mijn wereld in tekst" (D13, 4.10): every cluster with its links and statuses, then the links to consent,
// partners, account and logout. It is also the accessible version of the world, in reading order.

import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LinkStatus } from '../services/kbcApi';
import type { TextGroup } from '../world/state/selectors';
import type { CategoryId } from '../world/types';
import { font, shadow, world } from '../theme';
import { Chip } from './ui';

const CHIP: Record<LinkStatus, { label: string; tone: 'ok' | 'info' | 'warn' }> = {
  actief: { label: 'actief', tone: 'ok' },
  gekend: { label: 'koppelen', tone: 'info' },
  mogelijk: { label: 'tip', tone: 'warn' },
};

export type TextLink = 'consent' | 'partners' | 'account' | 'logout';

const LINKS: { id: TextLink; label: string }[] = [
  { id: 'consent', label: 'Op jouw maat' },
  { id: 'partners', label: 'Gekoppelde partners' },
  { id: 'account', label: 'Account' },
  { id: 'logout', label: 'Uitloggen' },
];

export function WorldText({
  groups,
  onOpenPlace,
  onLink,
}: {
  groups: TextGroup[];
  onOpenPlace: (id: CategoryId) => void;
  onLink: (link: TextLink) => void;
}) {
  return (
    <View style={styles.wrap}>
      <Text role="heading" aria-level={2} style={styles.title}>
        Mijn wereld in tekst
      </Text>
      {groups.map((g) => (
        <View key={g.ecosysteem} style={styles.group}>
          <Text role="heading" aria-level={3} style={styles.groupTitle}>
            {g.naam}
          </Text>
          {g.rows.map((r) => {
            const chip = CHIP[r.status];
            return (
              <Pressable
                key={r.linkId}
                role="button"
                aria-label={`${r.label}, ${r.who}, ${chip.label}`}
                disabled={!r.placeId}
                onPress={() => r.placeId && onOpenPlace(r.placeId)}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                <Text style={styles.label} numberOfLines={1}>
                  {r.label}
                </Text>
                <Text style={styles.who}>{r.who}</Text>
                <Chip tone={chip.tone}>{chip.label}</Chip>
              </Pressable>
            );
          })}
        </View>
      ))}
      <View style={styles.links}>
        {LINKS.map((l) => (
          <Pressable
            key={l.id}
            role="button"
            onPress={() => onLink(l.id)}
            style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
            <Text style={[styles.linkText, l.id === 'logout' && styles.logout]}>{l.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  title: { fontFamily: font.display700, fontSize: 20, color: world.title, marginTop: 8 },
  group: { backgroundColor: world.card, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, boxShadow: shadow.tile },
  groupTitle: { fontFamily: font.display600, fontSize: 15, color: world.ink, marginBottom: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderColor: world.line,
  },
  pressed: { opacity: 0.6 },
  label: { flex: 1, minWidth: 0, fontFamily: font.body700, fontSize: 13.5, color: world.ink },
  who: { fontFamily: font.body600, fontSize: 12, color: world.soft },
  links: { backgroundColor: world.card, borderRadius: 20, paddingHorizontal: 14, boxShadow: shadow.tile },
  link: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderColor: world.line },
  linkText: { flex: 1, fontFamily: font.body800, fontSize: 14, color: world.ink },
  logout: { color: '#b3261e' },
  chevron: { fontFamily: font.body800, fontSize: 18, color: world.soft },
});
