// Kate Coin balance. When it rises it counts up (~600ms) and pops to scale 1.15.

import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';

import { font, shadow, world } from '../theme';

const COUNT_MS = 600;
const formatter = new Intl.NumberFormat('nl-BE');

export function KateCoinBadge({ value }: { value: number }) {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(value);
  const previous = useRef(value);
  const scale = useSharedValue(1);

  useEffect(() => {
    const from = previous.current;
    previous.current = value;
    if (value <= from || reduceMotion) {
      setShown(value);
      return;
    }
    scale.value = withSequence(withTiming(1.15, { duration: 300 }), withTiming(1, { duration: 300 }));
    const start = Date.now();
    const timer = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / COUNT_MS);
      setShown(Math.round(from + (value - from) * t));
      if (t === 1) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [value, reduceMotion, scale]);

  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      style={[styles.coins, animated]}
      role="status"
      aria-label={`${formatter.format(value)} Kate Coins`}>
      <Svg width={24} height={24} viewBox="0 0 24 24" aria-hidden>
        <Defs>
          <RadialGradient id="kateCoinGradient" cx="35%" cy="30%" r="75%">
            <Stop offset="0" stopColor="#fff3a8" />
            <Stop offset=".5" stopColor="#ffcc1f" />
            <Stop offset="1" stopColor="#d99100" />
          </RadialGradient>
        </Defs>
        <Circle cx={12} cy={12} r={11} fill="url(#kateCoinGradient)" />
        <Circle cx={12} cy={12} r={7.5} fill="none" stroke="#b87700" strokeWidth={1.4} opacity={0.6} />
        <SvgText
          x={12}
          y={16}
          textAnchor="middle"
          fontFamily={font.display700}
          fontWeight="700"
          fontSize={10}
          fill="#8a5a00">
          K
        </SvgText>
      </Svg>
      <Text style={styles.value}>{formatter.format(shown)}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  coins: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingVertical: 5,
    paddingLeft: 6,
    paddingRight: 12,
    boxShadow: shadow.coins,
  },
  value: {
    fontFamily: font.body800,
    fontSize: 14,
    color: world.ink,
    fontVariant: ['tabular-nums'],
  },
});
