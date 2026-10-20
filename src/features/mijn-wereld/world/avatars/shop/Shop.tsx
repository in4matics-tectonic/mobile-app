// shop: a corner grocery with a striped awning in the partner's colours, a window full of shelves,
// fruit crates out front and a trolley by the side wall. An essential: unbranded, it draws without a sign.

import { BrandSign } from '../../scene/Badges';
import type { AvatarProps } from '../types';

/** Front face x range; the side wall recedes to the right of it. */
const L = 10;
const R = 124;
const ROOF = 312;

export const shopTop = (signs: number) => (signs ? 290 : ROOF);
export const SHOP_FLAG = { x: R - 4, y: 318 };

const UNBRANDED = { primary: '#ff6b4a', secondary: '#ffd34d' };
const PRODUCTS = ['#ff6b4a', '#ffd34d', '#35d07f', '#4fb0ff', '#ffffff', '#ff9f43'];

export function Shop({ width, brands }: AvatarProps) {
  const brand = brands[0];
  const primary = brand?.colors.primary ?? UNBRANDED.primary;
  const secondary = brand?.colors.secondary ?? UNBRANDED.secondary;
  const stripes = 8;
  const top = (i: number) => L + (i * (R - L)) / stripes;
  const bottom = (i: number) => L - 6 + (i * (R - L + 12)) / stripes;
  return (
    <>
      <ellipse cx={width / 2} cy={420} rx={width / 2} ry={7} fill="#1d5e24" opacity=".3" filter="url(#soft)" />
      <g filter="url(#lift)">
        {/* walls */}
        <rect x={L} y={330} width={R - L} height={90} fill="url(#wall)" />
        <path d={`M${R} 330 L${R + 18} 322 L${R + 18} 412 L${R} 420 Z`} fill="url(#wallSide)" />
        {/* flat roof with a cornice in the partner's colour */}
        <path d={`M${L - 4} 320 L${L + 14} ${ROOF} L${R + 22} ${ROOF} L${R + 4} 320 Z`} fill={primary} />
        <path d={`M${L - 4} 320 L${L + 14} ${ROOF} L${R + 22} ${ROOF} L${R + 4} 320 Z`} fill="#ffffff" opacity={0.3} />
        <rect x={L - 4} y={320} width={R - L + 8} height={12} fill={primary} />
        <path d={`M${R + 4} 320 L${R + 22} ${ROOF} L${R + 22} 324 L${R + 4} 332 Z`} fill={primary} />
        <path d={`M${R + 4} 320 L${R + 22} ${ROOF} L${R + 22} 324 L${R + 4} 332 Z`} fill="#000000" opacity={0.25} />
        <rect x={L - 4} y={330} width={R - L + 8} height={2.2} fill={secondary} />
        {/* striped awning, scalloped */}
        <rect x={L - 2} y={336} width={R - L + 4} height={3} rx={1.5} fill="#5a6b82" />
        {Array.from({ length: stripes }, (_, i) => {
          const color = i % 2 ? '#ffffff' : primary;
          const bw = bottom(i + 1) - bottom(i);
          return (
            <g key={i} fill={color}>
              <path d={`M${top(i)} 338 L${top(i + 1)} 338 L${bottom(i + 1)} 356 L${bottom(i)} 356 Z`} />
              <path d={`M${bottom(i)} 355.5 a${bw / 2} ${bw / 3} 0 0 0 ${bw} 0 Z`} />
            </g>
          );
        })}
        <path d={`M${L} 338 L${R} 338 L${R + 6} 356 L${L - 6} 356 Z`} fill="#000000" opacity={0.06} />
        {/* shop window with shelves */}
        <rect x={18} y={366} width={62} height={40} rx={2} fill="url(#glass)" />
        {[379, 393, 405].map((y, s) => (
          <g key={y}>
            {Array.from({ length: 8 }, (_, i) => (
              <rect key={i} x={21 + i * 7.2} y={y - 8 + ((i + s) % 3 === 0 ? 2 : 0)} width={5.2} height={(i + s) % 3 === 0 ? 6 : 8} rx={1.2} fill={PRODUCTS[(i + s * 2) % PRODUCTS.length]} />
            ))}
            <rect x={19} y={y} width={60} height={1.6} fill="#ffffff" opacity={0.85} />
          </g>
        ))}
        <path d="M30 366 L40 366 L26 406 L18 406 L18 398 Z" fill="#ffffff" opacity={0.28} />
        <rect x={18} y={366} width={62} height={40} rx={2} fill="none" stroke="#ffffff" strokeWidth={2.5} />
        {/* glass door */}
        <rect x={88} y={364} width={26} height={56} rx={2} fill="url(#glass)" stroke={primary} strokeWidth={3} />
        <path d="M94 366 L100 366 L92 400 L90 400 Z" fill="#ffffff" opacity={0.35} />
        <rect x={91} y={390} width={2.4} height={9} rx={1.2} fill="#ffffff" />
        {/* fruit crates */}
        {[20, 43].map((x, c) => (
          <g key={x}>
            {[0, 1, 2, 3, 4].map((i) => (
              <circle
                key={i}
                cx={x + 4 + (i % 3) * 6.4 + (i > 2 ? 3 : 0)}
                cy={i > 2 ? 404 : 402}
                r={3.5}
                fill={c ? (i % 2 ? '#7ed957' : '#ff4d4d') : '#ff9f1c'}
              />
            ))}
            <rect x={x} y={404} width={21} height={16} rx={1.6} fill="#c9935e" />
            <path d={`M${x} 410 H${x + 21} M${x} 415 H${x + 21}`} stroke="#a87443" strokeWidth={1} />
          </g>
        ))}
        {/* trolley by the side wall */}
        <g stroke="#8fa1b5" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M126 397 L130 399 L146 399 L143 410 L132 410 Z" />
          <path d="M133 403 H144 M137 399 V410 M141 399 V410" strokeWidth={1} />
          <path d="M132 410 L131 415 H144" />
        </g>
        <circle cx={133} cy={417} r={2.2} fill="#4d5c72" />
        <circle cx={142} cy={417} r={2.2} fill="#4d5c72" />
      </g>
      {brand && (
        <>
          <rect x={50} y={306} width={3} height={8} fill="#5a6b82" />
          <rect x={82} y={306} width={3} height={8} fill="#5a6b82" />
          <BrandSign brand={brand} cx={(L + R) / 2} y={290} size={12} minWidth={56} />
        </>
      )}
    </>
  );
}
