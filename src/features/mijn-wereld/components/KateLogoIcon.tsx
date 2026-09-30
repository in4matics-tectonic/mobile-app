// Kate logo for native UI (Kate card). Same geometry as <symbol id="kateLogo"> in the prototype.

import Svg, { Circle, G, Line } from 'react-native-svg';

const DASHES: [number, number, number, number][] = [
  [-29, -85, -3, -85],
  [-67, -43, 11, -43],
  [-89, 0, 88, 0],
  [-11, 42, 67, 42],
  [2, 84, 28, 84],
];

export function KateLogoIcon({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="-200 -200 400 400" aria-hidden>
      <Circle r={200} fill="#b3e0f5" />
      <Circle r={184} fill="#e2f2fc" />
      <Circle r={168} fill="#f1f8fe" />
      <Circle r={152} fill="#fbfdff" />
      <G stroke="#009fe3" strokeWidth={22} strokeLinecap="round">
        {DASHES.map(([x1, y1, x2, y2]) => (
          <Line key={`${x1}${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </G>
    </Svg>
  );
}
