// energy: the phase-1 windmill with spinning blades, plus a small solar field at its foot.

import styles from '../../street.module.css';
import type { AvatarProps } from '../types';

const BLADE = 'M0 0 C -4 -12, -3 -30, 0 -38 C 3 -30, 4 -12, 0 0 Z';
const K = 1.6;
/** Phase-1 art: mast at x 286, standing on y 150, hub at y 72. */
const transform = (width: number) => `translate(${width / 2 - 286 * K} ${420 - 150 * K}) scale(${K})`;

export const ENERGY_TOP = 420 - (150 - 34) * K;

export function Energy({ width }: AvatarProps) {
  return (
    <>
      <g transform={transform(width)}>
        <ellipse cx="286" cy="150" rx="16" ry="5" fill="#1d5e24" opacity=".35" filter="url(#soft)" />
        <path d="M281 150 L284 74 L288 74 L291 150 Z" fill="#f4f7fb" filter="url(#lift)" />
        <path d="M286 150 L288 74 L291 150 Z" fill="#cdd8e4" />
        <g transform="translate(286 72)">
          <g className={styles.blades}>
            <path d={BLADE} fill="#fff" filter="url(#lift)" />
            <path d={BLADE} fill="#fff" transform="rotate(120)" filter="url(#lift)" />
            <path d={BLADE} fill="#fff" transform="rotate(240)" filter="url(#lift)" />
          </g>
          <circle r="5" fill="#0a5fb4" />
          <circle r="2" cx="-1.5" cy="-1.5" fill="#8fd0ff" />
        </g>
      </g>
      <g filter="url(#lift)">
        <path d={`M${width / 2 + 8} 418 L${width / 2 + 14} 404 L${width / 2 + 36} 404 L${width / 2 + 32} 418 Z`} fill="url(#panel)" />
        <path d={`M${width / 2 + 11} 411 L${width / 2 + 34} 411`} stroke="#a9c3ff" strokeWidth=".8" opacity=".7" />
      </g>
    </>
  );
}
