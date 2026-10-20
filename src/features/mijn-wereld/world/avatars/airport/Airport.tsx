// airport: a glass terminal on the coast with a control tower. The plane flies in the plane lane (Street).

import { BrandSign } from '../../scene/Badges';
import type { AvatarProps } from '../types';

export const AIRPORT_TOP = 280;

export function Airport({ width, brands }: AvatarProps) {
  const w = width;
  return (
    <>
      <ellipse cx={w / 2} cy={420} rx={w / 2} ry={6} fill="#0b2a4a" opacity=".2" filter="url(#soft)" />
      <g filter="url(#lift)">
        {/* tower */}
        <rect x={w - 46} y={300} width={14} height={80} fill="url(#stone)" />
        <path d={`M${w - 58} 300 L${w - 20} 300 L${w - 24} 282 L${w - 54} 282 Z`} fill="url(#glass)" />
        <rect x={w - 60} y={298} width={42} height={5} rx={2} fill="#5a6b82" />
        <rect x={w - 41} y={274} width={4} height={8} fill="#5a6b82" />
        {/* terminal */}
        <rect x={8} y={364} width={w - 16} height={56} fill="url(#glass)" />
        <path d={`M4 366 Q ${w / 2} 326 ${w - 4} 366 Z`} fill="#f4f7fb" />
        <path d={`M4 366 Q ${w / 2} 326 ${w - 4} 366`} stroke="#c9d5e3" strokeWidth={2} fill="none" />
        {Array.from({ length: Math.floor((w - 24) / 22) }, (_, i) => (
          <rect key={i} x={14 + i * 22} y={370} width={2} height={50} fill="#ffffff" opacity={0.7} />
        ))}
        <rect x={w / 2 - 12} y={396} width={24} height={24} rx={3} fill="#0b2c5a" opacity={0.7} />
      </g>
      {brands.map((b, i) => (
        <BrandSign key={b.partnerId} brand={b} cx={w / 2 - 14} y={340 - i * 26} size={11} />
      ))}
    </>
  );
}
