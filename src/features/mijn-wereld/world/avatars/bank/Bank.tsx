// bank: a small classical bank with columns and the KBC sign in its pediment.

import { BrandSign } from '../../scene/Badges';
import type { AvatarProps } from '../types';

export const BANK_TOP = 286;

export function Bank({ width, brands }: AvatarProps) {
  const w = width;
  const kbc = brands[0];
  const cols = [0.14, 0.33, 0.57, 0.76].map((f) => w * f);
  return (
    <>
      <ellipse cx={w / 2} cy={420} rx={w / 2} ry={7} fill="#1d5e24" opacity=".3" filter="url(#soft)" />
      <g filter="url(#lift)">
        <rect x={6} y={412} width={w - 12} height={8} rx={2} fill="#cfd9e5" />
        <rect x={12} y={405} width={w - 24} height={8} rx={2} fill="url(#stone)" />
        <rect x={16} y={340} width={w - 32} height={66} fill="#e6edf5" />
        {/* tall windows between the columns, and the door with its fanlight */}
        {[0.235, 0.665].map((f) => (
          <rect key={f} x={w * f - 6} y={350} width={12} height={44} rx={6} fill="url(#glass)" />
        ))}
        <rect x={w / 2 - 9} y={370} width={18} height={35} rx={8} fill="#0a5fb4" />
        <path d={`M${w / 2 - 6} 378 a6 6 0 0 1 12 0 Z`} fill="#8fd0ff" />
        {cols.map((x) => (
          <g key={x}>
            <rect x={x - 7} y={338} width={14} height={68} rx={2} fill="url(#stone)" />
            <rect x={x - 9} y={336} width={18} height={5} rx={1.5} fill="#f4f7fb" />
          </g>
        ))}
        <rect x={6} y={324} width={w - 12} height={14} rx={2} fill="url(#stone)" />
        <path d={`M2 326 L${w / 2} ${BANK_TOP} L${w - 2} 326 Z`} fill="url(#stone)" />
        <path d={`M2 326 L${w / 2} ${BANK_TOP} L${w - 2} 326`} stroke="#c9d5e3" strokeWidth={2} fill="none" />
      </g>
      {/* lanterns by the steps */}
      {[4, w - 6].map((x) => (
        <g key={x}>
          <rect x={x} y={390} width={2} height={22} fill="#4d5c72" />
          <rect x={x - 2} y={384} width={6} height={7} rx={1.5} fill="#4d5c72" />
          <rect x={x - 0.6} y={385.4} width={3.2} height={4.2} rx={1} fill="#ffe27a" />
        </g>
      ))}
      {kbc && <BrandSign brand={kbc} cx={w / 2} y={303} size={11} minWidth={44} />}
    </>
  );
}
