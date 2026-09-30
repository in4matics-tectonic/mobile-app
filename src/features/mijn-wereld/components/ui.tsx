// Small shared primitives: pill buttons and status chips.

import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { chipTones, font, shadow, world } from '../theme';
import type { DomainStatus } from '../state/types';

type Variant = 'primary' | 'secondary' | 'link';

export function PillButton({
  label,
  onPress,
  variant = 'primary',
  small,
  style,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}) {
  return (
    <Pressable
      role="button"
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        small && styles.small,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'link' && styles.link,
        pressed && styles.pressed,
        style,
      ]}>
      <Text
        style={[
          styles.label,
          small && styles.smallLabel,
          variant === 'primary' && { color: '#fff' },
          variant === 'secondary' && { color: world.blue },
          variant === 'link' && styles.linkLabel,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Chip({ tone, children }: { tone: DomainStatus; children: ReactNode }) {
  const c = chipTones[tone];
  return <Text style={[styles.chip, { backgroundColor: c.bg, color: c.fg }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: { paddingVertical: 6, paddingHorizontal: 12 },
  primary: { backgroundColor: world.blue, boxShadow: shadow.primary },
  secondary: { backgroundColor: world.secondaryBg },
  link: { backgroundColor: 'transparent', paddingHorizontal: 2 },
  pressed: { transform: [{ translateY: 2 }] },
  label: { fontFamily: font.body800, fontSize: 13, color: world.ink },
  smallLabel: { fontSize: 12 },
  linkLabel: { color: world.soft, textDecorationLine: 'underline' },
  chip: {
    fontFamily: font.body800,
    fontSize: 10.5,
    letterSpacing: 0.2,
    borderRadius: 999,
    paddingVertical: 1,
    paddingHorizontal: 7,
    overflow: 'hidden',
  },
});
