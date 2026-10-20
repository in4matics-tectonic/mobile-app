// coin-tree: the phase-1 savings tree with gold coins.

import type { AvatarProps } from '../types';

const K = 1.25;
/** Phase-1 art spans x 31–105 and stands on y 206. */
const transform = (width: number) => `translate(${width / 2 - 68 * K} ${420 - 206 * K}) scale(${K})`;

export const COIN_TREE_TOP = 420 - (206 - 119) * K;

export function CoinTree({ width }: AvatarProps) {
  return (
    <g transform={transform(width)}>
      <ellipse cx="66" cy="206" rx="28" ry="7" fill="#1d5e24" opacity=".35" filter="url(#soft)" />
      <path d="M61 206 C 63 190, 62 180, 60 170 L72 170 C 70 180, 69 190, 71 206 Z" fill="#8a5431" />
      <g filter="url(#lift)" fill="url(#leaf)">
        <circle cx="52" cy="160" r="18" />
        <circle cx="80" cy="158" r="19" />
        <circle cx="66" cy="140" r="21" />
      </g>
      <g>
        <circle cx="54" cy="150" r="5" fill="url(#coin)" />
        <circle cx="76" cy="146" r="5" fill="url(#coin)" />
        <circle cx="68" cy="164" r="5" fill="url(#coin)" />
        <circle cx="86" cy="164" r="4.5" fill="url(#coin)" />
      </g>
    </g>
  );
}
