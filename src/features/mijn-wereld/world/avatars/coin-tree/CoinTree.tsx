// coin-tree: the phase-1 savings tree with gold coins that glint now and then. Once everything for the birth is
// arranged, a swing hangs from it.

import styles from '../../street.module.css';
import type { AvatarProps } from '../types';

const K = 1.25;
/** Phase-1 art spans x 31–105 and stands on y 206. */
const transform = (width: number) => `translate(${width / 2 - 68 * K} ${420 - 206 * K}) scale(${K})`;

export const COIN_TREE_TOP = 420 - (206 - 119) * K;

export function CoinTree({ width, household }: AvatarProps) {
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
        <g fill="#fff" opacity=".8">
          <circle cx="52.6" cy="148.4" r="1.3" />
          <circle cx="74.6" cy="144.4" r="1.3" />
          <circle cx="66.6" cy="162.4" r="1.3" />
          <circle cx="84.8" cy="162.6" r="1.1" />
        </g>
      </g>
      <g style={{ opacity: household.swing ? 1 : 0, transition: 'opacity .8s ease' }} aria-hidden={!household.swing}>
        <path d="M84 172 L84 196 M96 170 L96 196" stroke="#6e4024" strokeWidth="1.4" />
        <rect x="81" y="195" width="18" height="4" rx="2" fill="#ff8a66" />
      </g>
      {/* now and then a coin catches the light */}
      {[
        [76, 146, 0],
        [54, 150, -1.4],
        [86, 164, -2.6],
      ].map(([x, y, delay]) => (
        <path
          key={x}
          className={styles.sparkleIdle}
          style={{ animationDelay: `${delay}s`, animationDuration: '4.2s' }}
          d={`M${x + 2} ${y - 7} l1.1 3 l3 1.1 l-3 1.1 l-1.1 3 l-1.1 -3 l-3 -1.1 l3 -1.1 Z`}
          fill="#fff"
        />
      ))}
    </g>
  );
}
