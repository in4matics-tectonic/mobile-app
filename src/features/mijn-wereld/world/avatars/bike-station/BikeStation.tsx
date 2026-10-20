// bike-station: a rack with shared bikes; each partner (Blue-bike, Velo, Mobit) gets a sign, stacked.

import { BrandSign } from '../../scene/Badges';
import type { AvatarProps } from '../types';

function Bike({ x, color }: { x: number; color: string }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <circle cx={0} cy={410} r={8} fill="none" stroke="#1b2433" strokeWidth={2.2} />
      <circle cx={22} cy={410} r={8} fill="none" stroke="#1b2433" strokeWidth={2.2} />
      <path d="M0 410 L8 396 L18 396 L22 410 M8 396 L11 410 L18 396 M6 392 L10 392 M18 396 L17 390 L21 390" stroke={color} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

export function bikeStationTop(signs: number) {
  return 372 - signs * 24;
}

export function BikeStation({ width, brands }: AvatarProps) {
  const color = brands[0]?.colors.primary ?? '#0a5fb4';
  return (
    <>
      <ellipse cx={width / 2} cy={420} rx={width / 2} ry={5} fill="#1d5e24" opacity=".3" filter="url(#soft)" />
      <rect x={6} y={404} width={width - 12} height={4} rx={2} fill="#9aa8b8" />
      <Bike x={14} color={color} />
      <Bike x={width / 2 - 8} color={color} />
      <Bike x={width - 32} color={color} />
      <rect x={width / 2 - 1.5} y={372} width={3} height={22} fill="#8a6a4a" />
      {brands.map((b, i) => (
        <BrandSign key={b.partnerId} brand={b} cx={width / 2} y={bikeStationTop(i + 1)} size={11} />
      ))}
    </>
  );
}
