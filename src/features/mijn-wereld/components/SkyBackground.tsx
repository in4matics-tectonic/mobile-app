// Daylight sky behind the header and island (#8fd0ff → #cdeeff), hard stop to the ground color.

import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { world } from '../theme';

export function SkyBackground({ height }: { height: number }) {
  return (
    <Svg
      style={[StyleSheet.absoluteFill, { height }]}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      aria-hidden>
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={world.skyTop} />
          <Stop offset="1" stopColor={world.skyBottom} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#sky)" />
    </Svg>
  );
}
