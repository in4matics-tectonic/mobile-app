// The Kate bar (D14, 4.9): looks like a chat input, rotates what Kate found, and opens the chat on a tap.
// Two copies share one ticker: the one in the page flow and the one docked above the tab bar (D17).

import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import type { KateTicker } from '../world/state/useKateTicker';
import { font, shadow, world } from '../theme';
import { KateLogoIcon } from './KateLogoIcon';

const OVERSHOOT = Easing.bezier(0.2, 0.9, 0.3, 1.1);
const PLACEHOLDER = 'Vraag Kate iets over je wereld…';
const MAX_DOTS = 5;
const TYPE_MS = 30;
const TYPE_CAP_MS = 1200;

export const KATE_BAR_HEIGHT = 56;

export function KateBar({
  ticker,
  reduced,
  announce = false,
  onPress,
  onHold,
  style,
}: {
  ticker: KateTicker;
  reduced: boolean;
  /** Only one copy speaks to the screen reader. */
  announce?: boolean;
  onPress: () => void;
  /** Pressed or focused: rotation pauses. */
  onHold: (held: boolean) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { current, index, count, newKey, announced } = ticker;
  const teaser = current?.teaser;
  const [shown, setShown] = useState(teaser);
  const [typed, setTyped] = useState<number | null>(null);
  const [seen, setSeen] = useState({ key: newKey, teaser });

  const textY = useSharedValue(0);
  const textOpacity = useSharedValue(1);
  const lift = useSharedValue(0);
  const ring = useSharedValue(0);
  const shimmer = useSharedValue(0);

  // A new finding takes over at once and types in; a plain rotation is animated below.
  if (seen.key !== newKey || seen.teaser !== teaser) {
    setSeen({ key: newKey, teaser });
    if (seen.key !== newKey && teaser && !reduced) {
      setShown(teaser);
      setTyped(0);
    }
  }

  // New finding: two rings pulse out of Kate's logo and the bar lifts 3px.
  useEffect(() => {
    if (!newKey || reduced) return;
    textY.set(0);
    textOpacity.set(1);
    ring.set(0);
    ring.set(withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }));
    lift.set(withSequence(withTiming(-3, { duration: 150 }), withTiming(0, { duration: 300, easing: OVERSHOOT })));
  }, [newKey, reduced, textY, textOpacity, ring, lift]);

  // Rotation: the outgoing teaser slides up and fades, the incoming one rises from below.
  useEffect(() => {
    if (teaser === shown) return;
    if (reduced) {
      textOpacity.set(withSequence(withTiming(0, { duration: 75 }), withTiming(1, { duration: 75 })));
      const t = setTimeout(() => setShown(teaser), 75);
      return () => clearTimeout(t);
    }
    textY.set(withTiming(-8, { duration: 250 }));
    textOpacity.set(withTiming(0, { duration: 250 }));
    const t = setTimeout(() => {
      setShown(teaser);
      setTyped(null);
      textY.set(10);
      textY.set(withTiming(0, { duration: 300, easing: OVERSHOOT }));
      textOpacity.set(withTiming(1, { duration: 300 }));
    }, 250);
    return () => clearTimeout(t);
  }, [teaser, shown, reduced, textY, textOpacity]);

  // Typing: 30ms per character, capped at 1.2s.
  const typing = typed !== null && !!shown && typed < shown.length;
  useEffect(() => {
    if (!typing || !shown) return;
    const step = Math.max(1, Math.ceil((shown.length * TYPE_MS) / TYPE_CAP_MS));
    const t = setTimeout(() => setTyped((n) => (n === null ? null : n + step)), TYPE_MS);
    return () => clearTimeout(t);
  }, [typing, typed, shown]);

  // Idle life: a soft light passes over Kate's logo every 3.2s.
  useEffect(() => {
    if (reduced) {
      shimmer.set(0);
      return;
    }
    shimmer.set(withRepeat(withSequence(withTiming(1, { duration: 900 }), withDelay(2300, withTiming(0, { duration: 0 }))), -1));
  }, [reduced, shimmer]);

  const barStyle = useAnimatedStyle(() => ({ transform: [{ translateY: lift.value }] }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value, transform: [{ translateY: textY.value }] }));
  const ringA = useAnimatedStyle(() => ({ opacity: (1 - ring.value) * 0.8 * (ring.value > 0 ? 1 : 0), transform: [{ scale: 1 + ring.value * 0.9 }] }));
  const ringB = useAnimatedStyle(() => {
    const v = Math.max(0, ring.value - 0.15) / 0.85;
    return { opacity: (1 - v) * 0.7 * (v > 0 ? 1 : 0), transform: [{ scale: 1 + v * 1.3 }] };
  });
  const shimmerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: -24 + shimmer.value * 48 }, { rotate: '20deg' }] }));

  const text = shown ? (typing ? shown.slice(0, typed!) : shown) : PLACEHOLDER;
  const dots = Math.min(count, MAX_DOTS);
  const label = shown ? `Chat met Kate: ${shown}` : 'Chat met Kate';

  return (
    <Animated.View style={[styles.wrap, barStyle, style]}>
      <Pressable
        role="button"
        aria-label={label}
        onPress={onPress}
        onPressIn={() => onHold(true)}
        onPressOut={() => onHold(false)}
        onFocus={() => onHold(true)}
        onBlur={() => onHold(false)}
        style={({ pressed }) => [styles.bar, pressed && styles.pressed]}>
        <View style={styles.logo}>
          <Animated.View style={[styles.ring, { borderColor: '#b3e0f5' }, ringA]} />
          <Animated.View style={[styles.ring, { borderColor: '#009fe3' }, ringB]} />
          <View style={styles.logoClip}>
            <KateLogoIcon size={32} />
            {!reduced && <Animated.View style={[styles.shimmer, shimmerStyle]} />}
          </View>
        </View>
        <View style={styles.middle}>
          <Animated.View style={textStyle}>
            <Text numberOfLines={2} style={[styles.teaser, !shown && styles.placeholder]}>
              {text}
            </Text>
          </Animated.View>
          {dots > 1 && (
            <View style={styles.dots} aria-hidden>
              {Array.from({ length: dots }, (_, i) => (
                <View key={i} style={[styles.dot, i === index % MAX_DOTS && styles.dotOn]} />
              ))}
            </View>
          )}
        </View>
        <View style={styles.send} aria-hidden>
          <Svg width={18} height={18} viewBox="0 0 24 24">
            <Path d="M4 12 L20 4 L14 20 L11.5 13 Z" fill="#fff" />
          </Svg>
        </View>
      </Pressable>
      {announce && (
        <Text aria-live="polite" style={styles.srOnly}>
          {announced?.teaser ?? ''}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 16 },
  bar: {
    height: KATE_BAR_HEIGHT,
    borderRadius: 28,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: world.line,
    boxShadow: shadow.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 8,
    gap: 10,
  },
  pressed: { transform: [{ translateY: 1 }] },
  logo: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  logoClip: { width: 32, height: 32, borderRadius: 16, overflow: 'hidden' },
  ring: { position: 'absolute', width: 32, height: 32, borderRadius: 16, borderWidth: 2, opacity: 0 },
  shimmer: { position: 'absolute', top: -6, left: 8, width: 10, height: 44, backgroundColor: 'rgba(255,255,255,.55)' },
  middle: { flex: 1, minWidth: 0, justifyContent: 'center' },
  teaser: { fontFamily: font.body700, fontSize: 14, lineHeight: 17, color: world.ink },
  placeholder: { color: world.soft },
  dots: { flexDirection: 'row', gap: 4, marginTop: 3 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: world.line },
  dotOn: { backgroundColor: world.blue },
  send: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: world.blue,
    boxShadow: shadow.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  srOnly: { position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0 },
});
