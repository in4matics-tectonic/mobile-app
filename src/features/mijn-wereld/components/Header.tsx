import { Platform, StyleSheet, Text, View } from 'react-native';

import { font, world } from '../theme';
import { KateCoinBadge } from './KateCoinBadge';

/** Fake device status row, only drawn inside the web phone frame. */
export function StatusBar() {
  return (
    <View style={styles.status}>
      <Text style={styles.statusText}>9:41</Text>
      <Text style={styles.statusText}>KBC Mobile</Text>
    </View>
  );
}

export function Header({ displayName, coins }: { displayName: string; coins: number }) {
  return (
    <View style={styles.head}>
      <View style={styles.titles}>
        <Text style={styles.greeting}>Hallo {displayName}</Text>
        <Text role="heading" aria-level={1} style={styles.title}>
          Mijn wereld
        </Text>
      </View>
      <KateCoinBadge value={coins} />
    </View>
  );
}

const styles = StyleSheet.create({
  status: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
    paddingHorizontal: 28,
  },
  statusText: { fontFamily: font.body800, fontSize: 13, color: world.ink },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingHorizontal: 20,
    gap: 8,
  },
  titles: { flexShrink: 1 },
  greeting: {
    fontFamily: font.body700,
    fontSize: 12,
    color: world.greeting,
    letterSpacing: 0.72,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: font.display700,
    fontSize: 28,
    lineHeight: Platform.select({ web: 34, default: 36 }),
    letterSpacing: -0.28,
    color: world.title,
    ...Platform.select({
      web: { textShadow: '0 2px 0 rgba(255,255,255,.6)' },
      default: {
        textShadowColor: 'rgba(255,255,255,.6)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 0,
      },
    }),
  },
});
