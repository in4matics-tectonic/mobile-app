// island: across the sea, a palm tree, a beach umbrella and a deck chair. The sand is part of the backdrop.

import type { AvatarProps } from '../types';

export const ISLAND_TOP = 318;

export function Island({ width }: AvatarProps) {
  const palm = width * 0.3;
  const umbrella = width * 0.68;
  return (
    <>
      {/* palm */}
      <path d={`M${palm} 420 C ${palm - 4} 390, ${palm + 4} 360, ${palm + 18} 336`} stroke="#9a6a3c" strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d={`M${palm} 420 C ${palm - 4} 390, ${palm + 4} 360, ${palm + 18} 336`} stroke="#c08a52" strokeWidth={3} strokeDasharray="4 6" fill="none" />
      <g transform={`translate(${palm + 18} 336)`} filter="url(#lift)">
        <path d="M0 0 C -14 -14, -36 -12, -48 2 C -32 -4, -16 -2, 0 0 Z" fill="url(#leaf)" />
        <path d="M0 0 C 14 -16, 38 -14, 50 0 C 32 -6, 16 -4, 0 0 Z" fill="url(#leaf)" />
        <path d="M0 0 C -6 -18, 4 -32, 18 -36 C 10 -24, 6 -12, 0 0 Z" fill="url(#leaf)" />
        <path d="M0 0 C -20 4, -30 16, -32 30 C -20 18, -10 10, 0 0 Z" fill="url(#leaf)" />
        <path d="M0 0 C 18 2, 30 14, 34 28 C 22 16, 12 8, 0 0 Z" fill="url(#leaf)" />
        <circle cx={-3} cy={5} r={4} fill="#7a4a24" />
        <circle cx={4} cy={6} r={4} fill="#6a3e1e" />
      </g>
      {/* umbrella and deck chair */}
      <rect x={umbrella - 1.5} y={372} width={3} height={48} fill="#8a6a4a" />
      <g filter="url(#lift)">
        <path d={`M${umbrella - 30} 376 Q ${umbrella} 340 ${umbrella + 30} 376 Z`} fill="#ff6b4a" />
        <path d={`M${umbrella - 10} 376 Q ${umbrella} 343 ${umbrella + 10} 376 Z`} fill="#fff" />
        <path d={`M${umbrella - 30} 376 Q ${umbrella} 340 ${umbrella + 30} 376`} stroke="#d9573a" strokeWidth={1.5} fill="none" />
        <path d={`M${umbrella + 14} 418 L${umbrella + 24} 398 L${umbrella + 50} 404 L${umbrella + 46} 418`} stroke="#3a86c8" strokeWidth={3} fill="none" strokeLinejoin="round" />
        <path d={`M${umbrella + 24} 398 L${umbrella + 50} 404 L${umbrella + 48} 410 L${umbrella + 22} 404 Z`} fill="#8fd0ff" />
      </g>
    </>
  );
}
