// house: the phase-1 house with solar panels, scaled onto the street (art in its original island coordinates),
// with a lived-in touch: a flower box, a hedge and letterbox, smoke from the chimney.

import styles from '../../street.module.css';
import type { AvatarProps } from '../types';

const K = 1.85;
/** Phase-1 art spans x 72–158 and stands on y 164. */
const transform = (width: number) => `translate(${width / 2 - 115 * K} ${420 - 164 * K}) scale(${K})`;

export const HOUSE_TOP = 420 - (164 - 72) * K;

export function House({ width }: AvatarProps) {
  return (
    <g transform={transform(width)}>
      <ellipse cx="116" cy="166" rx="46" ry="11" fill="#1d5e24" opacity=".35" filter="url(#soft)" />
      <g filter="url(#lift)">
        <path d="M78 118 L118 118 L118 164 L78 164 Z" fill="url(#wall)" />
        <path d="M118 118 L152 108 L152 152 L118 164 Z" fill="url(#wallSide)" />
        <path d="M72 122 L98 90 L124 122 Z" fill="#c43f22" />
        <path d="M98 90 L136 78 L158 110 L124 122 Z" fill="url(#roof)" />
        <path d="M98 90 L136 78" stroke="#ffb199" strokeWidth="3" strokeLinecap="round" />
        <g>
          <path d="M112 99 L132 92 L144 108 L124 115 Z" fill="url(#panel)" />
          <path
            d="M118 97 L130 112 M125 94 L137 110 M114 104 L136 97 M119 110 L141 103"
            stroke="#a9c3ff"
            strokeWidth=".8"
            opacity=".7"
          />
          <path d="M114 100 L130 94" stroke="#fff" strokeWidth="1.5" opacity=".6" />
        </g>
        <rect x="138" y="72" width="8" height="18" rx="2" fill="#b0452b" />
        <rect x="92" y="140" width="13" height="24" rx="6" fill="#0a5fb4" />
        <circle cx="102" cy="153" r="1.4" fill="#ffd34d" />
        <rect x="82" y="128" width="8" height="9" rx="2" fill="url(#win)" />
        <path d="M126 130 L140 126 L140 138 L126 142 Z" fill="url(#win)" />
        <path d="M78 164 L118 164 L152 152" stroke="#000" strokeOpacity=".08" strokeWidth="2" fill="none" />
        {/* window bars, a flower box, the door lamp */}
        <path d="M86 128 V137 M82 132.5 H90 M133 128 V140 M126 136 L140 132" stroke="#fff" strokeWidth=".8" />
        <path d="M125 142.6 L141 138 L141 141 L125 145.6 Z" fill="#8a5431" />
        <circle cx="128" cy="141.4" r="1.4" fill="#ff6b8a" />
        <circle cx="131.6" cy="140.4" r="1.4" fill="#ffd34d" />
        <circle cx="135.2" cy="139.4" r="1.4" fill="#ff6b8a" />
        <circle cx="138.8" cy="138.4" r="1.4" fill="#fff" />
        <rect x="107" y="141" width="2.2" height="3.2" rx="1" fill="#ffd34d" />
        {/* hedge and letterbox by the front corner */}
        <circle cx="66" cy="160" r="5" fill="url(#leaf)" />
        <circle cx="73" cy="159" r="5.6" fill="url(#leaf)" />
        <rect x="62.6" y="152" width="1.2" height="12" fill="#5a6b82" />
        <rect x="59.6" y="149" width="7" height="5" rx="1.6" fill="#e2001a" />
      </g>
      {/* chimney smoke, outside the shadowed group */}
      {[0, 1, 2].map((i) => (
        <circle key={i} className={styles.smoke} style={{ animationDelay: `${-i * 1.2}s` }} cx="142" cy="66" r="4" fill="#ffffff" />
      ))}
    </g>
  );
}
