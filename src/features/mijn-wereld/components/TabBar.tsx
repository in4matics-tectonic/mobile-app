// Bottom navigation of KBC Mobile. In this demo only "Mijn wereld" and "Meer" (account) respond;
// the chat with Kate opens from the Kate orb on the island.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { font, world } from '../theme';

const TABS = ['Mijn wereld', 'Rekeningen', 'Kate', 'Meer'] as const;
export type Tab = (typeof TABS)[number];

export function TabBar({
  bottomInset = 0,
  active = 'Mijn wereld',
  actions = {},
}: {
  bottomInset?: number;
  /** The highlighted tab. */
  active?: Tab;
  /** Tabs without an action are shown but disabled. */
  actions?: Partial<Record<Tab, () => void>>;
}) {
  return (
    <View role="tablist" style={[styles.tabs, { paddingBottom: 22 + bottomInset }]}>
      {TABS.map((tab) => {
        const selected = tab === active;
        const action = actions[tab];
        return (
          <Pressable
            key={tab}
            role="tab"
            aria-selected={selected}
            aria-disabled={!selected && !action}
            disabled={!action}
            onPress={action}
            style={styles.tab}>
            {selected ? (
              <Svg width={22} height={22} aria-hidden>
                <Defs>
                  <RadialGradient id="tabActive" cx="35%" cy="30%" r="75%">
                    <Stop offset="0" stopColor="#8fd0ff" />
                    <Stop offset="1" stopColor={world.blue} />
                  </RadialGradient>
                </Defs>
                <Circle cx={11} cy={11} r={11} fill="url(#tabActive)" />
              </Svg>
            ) : (
              <View style={styles.icon} />
            )}
            <Text style={[styles.label, selected && styles.active]}>{tab}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e4ebf3',
  },
  tab: { alignItems: 'center', gap: 3 },
  icon: { width: 22, height: 22, borderRadius: 7, backgroundColor: '#8a9ab0', opacity: 0.25 },
  label: { fontFamily: font.body800, fontSize: 11, color: '#8a9ab0' },
  active: { color: world.blue },
});
