// placeholder: a labelled building in the partner's colours, for categories without their own art yet (M7).
// The data pipeline works end to end before every drawing exists.

import { BrandSign } from '../../scene/Badges';
import { labelFont } from '../../scene/font';
import styles from '../../street.module.css';
import type { AvatarProps } from '../types';

export function placeholderHeight(width: number) {
  return Math.min(130, Math.max(80, width * 0.75));
}

export function placeholderTop(width: number, signs: number) {
  return 420 - placeholderHeight(width) - 8 - Math.max(1, signs) * 26;
}

export function Placeholder({ width, label, brands }: AvatarProps) {
  const w = width;
  const h = placeholderHeight(w);
  const top = 420 - h;
  const accent = brands[0]?.colors.primary ?? '#7fa6cf';
  const stripes = Math.max(4, Math.floor((w - 16) / 14));
  const windows = Math.max(1, Math.floor((w - 40) / 30));
  return (
    <>
      <ellipse cx={w / 2} cy={420} rx={w / 2} ry={6} fill="#1d5e24" opacity=".3" filter="url(#soft)" />
      <g filter="url(#lift)">
        <rect x={8} y={top} width={w - 16} height={h} rx={4} fill="url(#wall)" />
        <rect x={4} y={top - 8} width={w - 8} height={12} rx={3} fill={accent} />
        {Array.from({ length: windows }, (_, i) => (
          <rect key={i} x={20 + i * 30} y={top + 14} width={18} height={16} rx={3} fill="url(#win)" />
        ))}
        <g>
          {Array.from({ length: stripes }, (_, i) => (
            <path
              key={i}
              d={`M${8 + i * ((w - 16) / stripes)} ${top + 40} h${(w - 16) / stripes} l-2 12 h${-(w - 16) / stripes + 4} Z`}
              fill={i % 2 ? '#ffffff' : accent}
            />
          ))}
        </g>
        <rect x={w / 2 - 10} y={420 - 30} width={20} height={30} rx={8} fill="#0a5fb4" />
        <rect x={16} y={420 - 34} width={w / 2 - 34} height={22} rx={3} fill="url(#glass)" />
        <rect x={w / 2 + 18} y={420 - 34} width={w / 2 - 34} height={22} rx={3} fill="url(#glass)" />
      </g>
      {brands.length ? (
        brands.map((b, i) => <BrandSign key={b.partnerId} brand={b} cx={w / 2} y={top - 34 - i * 26} size={11} />)
      ) : (
        <g className={styles.sign}>
          <rect x={w / 2 - (label.length * 3.4 + 10)} y={top - 34} width={label.length * 6.8 + 20} height={22} rx={8} fill="#ffffff" filter="url(#lift)" />
          <text x={w / 2} y={top - 19} textAnchor="middle" fontSize={11} fill="#12305a" {...labelFont}>
            {label}
          </text>
        </g>
      )}
    </>
  );
}
