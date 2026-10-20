// estate-agency: a Flemish townhouse with a stepped gable, the agency's window full of house listings and a
// "te koop" board out front. The partner (Immoscoop) paints the window frame, the door and the sign.

import { BrandSign } from '../../scene/Badges';
import { labelFont } from '../../scene/font';
import styles from '../../street.module.css';
import type { AvatarProps } from '../types';

export const ESTATE_AGENCY_TOP = 256;
export const ESTATE_AGENCY_FLAG = { x: 54, y: 257 };

const GABLE = 'M12 420 V290 H22 V280 H32 V270 H42 V258 H66 V270 H76 V280 H86 V290 H96 V420 Z';
const COPING = [
  [11, 288, 12],
  [21, 278, 12],
  [31, 268, 12],
  [41, 256, 26],
  [65, 268, 12],
  [75, 278, 12],
  [85, 288, 12],
] as const;

export function EstateAgency({ width, brands }: AvatarProps) {
  const brand = brands[0];
  const frame = brand?.colors.primary ?? '#2d333a';
  const accent = brand?.colors.secondary ?? '#dd2c88';
  return (
    <>
      <ellipse cx={width / 2} cy={420} rx={width / 2} ry={6} fill="#1d5e24" opacity=".3" filter="url(#soft)" />
      <g filter="url(#lift)">
        <path d="M96 300 L108 294 L108 414 L96 420 Z" fill="#a94f35" />
        <path d={GABLE} fill="url(#brick)" />
        <path
          d={Array.from({ length: 13 }, (_, i) => `M12 ${304 + i * 9} H96`).join(' ')}
          stroke="#9c4329"
          strokeOpacity={0.22}
          strokeWidth={0.8}
        />
        {COPING.map(([x, y, w]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={w} height={3} rx={1} fill="#f3e8d6" />
        ))}
        {/* gable window and the upper floor */}
        <circle cx={54} cy={272} r={6} fill="url(#glass)" stroke="#ffffff" strokeWidth={1.6} />
        {[22, 66].map((x) => (
          <g key={x}>
            <rect x={x} y={304} width={20} height={28} rx={2} fill="url(#win)" stroke="#ffffff" strokeWidth={2} />
            <path d={`M${x + 10} 304 V332 M${x} 316 H${x + 20}`} stroke="#ffffff" strokeWidth={1.4} />
            <rect x={x - 2} y={332} width={24} height={3} rx={1} fill="#f3e8d6" />
          </g>
        ))}
        {/* the agency window: listings in two rows */}
        <rect x={18} y={370} width={50} height={40} rx={2} fill={frame} />
        <rect x={21} y={373} width={44} height={34} rx={1} fill="#f7f9fc" />
        {[0, 1].map((row) =>
          [0, 1, 2].map((col) => {
            const x = 23 + col * 14.4;
            const y = 375 + row * 16;
            return (
              <g key={`${row}-${col}`}>
                <rect x={x} y={y} width={12} height={14} rx={1.2} fill="#ffffff" stroke="#d6dde6" strokeWidth={0.8} />
                <path d={`M${x + 2.6} ${y + 7} L${x + 6} ${y + 3.4} L${x + 9.4} ${y + 7} V${y + 10} H${x + 2.6} Z`} fill={(row + col) % 2 ? accent : '#2f95f0'} />
                <rect x={x + 2.4} y={y + 11.2} width={7.2} height={1.3} rx={0.6} fill="#c3ccd6" />
              </g>
            );
          }),
        )}
        <path d="M24 373 L32 373 L22 407 L21 407 L21 380 Z" fill="#ffffff" opacity={0.35} />
        {/* door */}
        <rect x={74} y={366} width={18} height={54} rx={2} fill={frame} />
        <rect x={77} y={370} width={12} height={20} rx={1.5} fill="url(#glass)" />
        <circle cx={88} cy={398} r={1.3} fill="#ffd34d" />
        <rect x={72} y={417} width={22} height={3} fill="#d6dde6" />
      </g>
      {brand && <BrandSign brand={brand} cx={54} y={343} size={10} minWidth={72} />}
      {/* "te koop" board on a post */}
      <rect x={2} y={392} width={2.4} height={28} fill="#8a6a4a" />
      <g className={styles.sign}>
        <rect x={-9} y={382} width={26} height={13} rx={2} fill="#ffffff" stroke={accent} strokeWidth={1.4} />
        <text x={4} y={391} textAnchor="middle" fontSize={6.4} fill={accent} {...labelFont}>
          TE KOOP
        </text>
      </g>
    </>
  );
}
