// train-station: a station hall with a clock tower, arched windows and a platform. Every ~25s a train in the
// partner's livery pulls in, waits at the platform and leaves (4.8).

import { BrandSign } from '../../scene/Badges';
import styles from '../../street.module.css';
import type { AvatarProps } from '../types';

export const TRAIN_STATION_TOP = 236;
export const TRAIN_STATION_FLAG = { x: 52, y: 324 };

const WINDOWS = [38, 58, 116, 136];

function Car({ x, livery }: { x: number; livery: string }) {
  return (
    <g>
      <rect x={x} y={392} width={54} height={22} rx={4} fill="url(#trainBody)" />
      <rect x={x} y={405} width={54} height={4} fill={livery} />
      <rect x={x} y={409} width={54} height={1.4} fill="#ffd34d" />
      {[5, 15, 34, 44].map((dx) => (
        <rect key={dx} x={x + dx} y={395} width={7} height={7} rx={1.5} fill="#2a4466" />
      ))}
      <rect x={x + 24} y={395} width={7} height={18} rx={1} fill="#cfd8e3" />
      <circle cx={x + 9} cy={415} r={2.4} fill="#1b2433" />
      <circle cx={x + 45} cy={415} r={2.4} fill="#1b2433" />
    </g>
  );
}

function Train({ livery }: { livery: string }) {
  return (
    <g className={styles.train} style={{ '--from': '-200px', '--to': '210px' } as object}>
      <Car x={8} livery={livery} />
      <Car x={64} livery={livery} />
      {/* locomotive, nose to the right: it pulls in from the left */}
      <path d="M120 392 H168 Q182 393 184 405 V414 H120 Z" fill="url(#trainBody)" />
      <rect x={120} y={405} width={64} height={4} fill={livery} />
      <rect x={120} y={409} width={64} height={1.4} fill="#ffd34d" />
      <path d="M166 395 H172 Q179 396 181 403 H166 Z" fill="#2a4466" />
      {[126, 137, 148].map((x) => (
        <rect key={x} x={x} y={395} width={7} height={7} rx={1.5} fill="#2a4466" />
      ))}
      <circle cx={180} cy={410.5} r={1.7} fill="#fff6c4" />
      <path d="M138 392 L145 383 L152 392" stroke="#5a6b82" strokeWidth={1.4} fill="none" />
      <circle cx={130} cy={415} r={2.4} fill="#1b2433" />
      <circle cx={174} cy={415} r={2.4} fill="#1b2433" />
    </g>
  );
}

export function TrainStation({ width, brands }: AvatarProps) {
  const brand = brands[0];
  const livery = brand?.colors.primary ?? '#0069b4';
  return (
    <>
      <ellipse cx={width / 2} cy={420} rx={width / 2} ry={7} fill="#1d5e24" opacity=".3" filter="url(#soft)" />
      <defs>
        <clipPath id="trainTrack">
          <rect x={-8} y={370} width={width + 16} height={56} />
        </clipPath>
      </defs>
      <g filter="url(#lift)">
        {/* hall */}
        <path d="M160 344 L172 338 L172 404 L160 408 Z" fill="url(#wallSide)" />
        <rect x={30} y={344} width={130} height={64} fill="url(#wall)" />
        <path d="M166 346 L178 340 L162 316 L150 320 Z" fill="#3e4d63" />
        <path d="M24 346 L46 320 L150 320 L166 346 Z" fill="url(#slate)" />
        <path d="M46 320 L150 320" stroke="#93a6bf" strokeWidth={2} strokeLinecap="round" />
        {WINDOWS.map((x) => (
          <g key={x}>
            <path d={`M${x} 394 V366 a8 8 0 0 1 16 0 V394 Z`} fill="url(#win)" stroke="#ffffff" strokeWidth={1.6} />
            <path d={`M${x + 8} 358 V394 M${x} 376 H${x + 16}`} stroke="#ffffff" strokeWidth={1.1} />
          </g>
        ))}
        {/* clock tower */}
        <rect x={80} y={262} width={30} height={84} fill="url(#wall)" />
        <rect x={104} y={262} width={6} height={84} fill="#e2b77e" opacity={0.5} />
        <path d="M76 263 L95 236 L114 263 Z" fill="url(#slate)" />
        <path d="M95 236 L114 263 L105 263 Z" fill="#000000" opacity={0.18} />
        <rect x={77} y={260} width={36} height={5} rx={1.5} fill="#f4f7fb" />
        <path d="M95 236 V228" stroke="#5a6b82" strokeWidth={1.6} />
        <circle cx={95} cy={227} r={2} fill="#ffd34d" />
        <circle cx={95} cy={284} r={10.5} fill="#ffffff" stroke={livery} strokeWidth={2.2} />
        <path d="M95 275.5 V277.5 M95 290.5 V292.5 M86.5 284 H88.5 M101.5 284 H103.5" stroke="#5a6b82" strokeWidth={1.2} />
        <line x1={95} y1={284} x2={90.6} y2={281.4} stroke="#1b2433" strokeWidth={1.8} strokeLinecap="round" />
        {/* entrance */}
        <path d="M86 408 V378 a9 9 0 0 1 18 0 V408 Z" fill={livery} />
        <path d="M89.5 404 V379 a5.5 5.5 0 0 1 11 0 V404 Z" fill="url(#glass)" />
        {/* platform canopy and lamp */}
        <path d="M166 366 L192 366 L192 371 L166 371 Z" fill={livery} />
        <rect x={180} y={371} width={2.4} height={37} fill="#5a6b82" />
        <rect x={10} y={366} width={2.4} height={42} fill="#5a6b82" />
        <path d="M6 366 H16 L14 361 H8 Z" fill="#5a6b82" />
        <circle cx={11.2} cy={368} r={2.2} fill="#fff6c4" />
        {/* platform, edge line, track */}
        <rect x={-4} y={408} width={width + 8} height={8} fill="#dfe6ee" />
        <rect x={-4} y={408} width={width + 8} height={1.8} fill="#ffd34d" />
      </g>
      {/* the minute hand turns outside the shadowed group, so the filter isn't repainted every frame */}
      <g transform="translate(95 284)">
        <line className={styles.clockHand} x1={0} y1={0} x2={0} y2={-8} stroke="#1b2433" strokeWidth={1.3} strokeLinecap="round" />
        <circle r={1.3} fill="#1b2433" />
      </g>
      <rect x={-6} y={416.5} width={width + 12} height={2.2} fill="#7a8699" />
      <path d={`M-6 419.6 H${width + 6}`} stroke="#8a6a4a" strokeWidth={2.2} strokeDasharray="3 6" />
      <g clipPath="url(#trainTrack)">
        <Train livery={livery} />
      </g>
      {brand && <BrandSign brand={brand} cx={95} y={312} size={12} minWidth={46} />}
    </>
  );
}
