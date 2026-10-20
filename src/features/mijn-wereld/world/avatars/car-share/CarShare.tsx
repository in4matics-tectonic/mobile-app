// car-share: two shared cars in the partner's colour, under its sign.

import { BrandSign } from '../../scene/Badges';
import type { AvatarProps } from '../types';

function MiniCar({ x, color }: { x: number; color: string }) {
  return (
    <g transform={`translate(${x} 0)`} filter="url(#lift)">
      <path d="M0 410 C 0 402, 5 399, 13 398 L 17 391 C 19 388, 22 387, 26 387 L 34 387 C 38 387, 41 389, 43 392 L 46 398 C 50 399, 52 403, 52 410 C 52 413, 50 414, 47 414 L 4 414 C 1 414, 0 413, 0 410 Z" fill={color} />
      <path d="M19 397 L 23 390 L 30 390 L 30 397 Z" fill="#cfefff" />
      <path d="M33 397 L 33 390 L 37 390 L 41 397 Z" fill="#a8dcff" />
      <circle cx={11} cy={414} r={5.5} fill="#1b2433" />
      <circle cx={41} cy={414} r={5.5} fill="#1b2433" />
      <circle cx={11} cy={414} r={2.2} fill="#c7d3e0" />
      <circle cx={41} cy={414} r={2.2} fill="#c7d3e0" />
    </g>
  );
}

export const CAR_SHARE_TOP = 340;

export function CarShare({ width, brands }: AvatarProps) {
  const color = brands[0]?.colors.primary ?? '#4fb0ff';
  return (
    <>
      <ellipse cx={width / 2} cy={420} rx={width / 2} ry={5} fill="#1d5e24" opacity=".3" filter="url(#soft)" />
      <rect x={width / 2 - 1.5} y={360} width={3} height={30} fill="#8a6a4a" />
      <MiniCar x={-6} color={color} />
      <MiniCar x={width - 46} color={color} />
      {brands[0] && <BrandSign brand={brands[0]} cx={width / 2} y={CAR_SHARE_TOP} size={11} />}
    </>
  );
}
