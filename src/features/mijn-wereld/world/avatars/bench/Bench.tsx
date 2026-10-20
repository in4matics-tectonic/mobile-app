// bench: a park bench under a big oak, where a robin hops on the backrest now and then. Pension: time to sit.

import styles from '../../street.module.css';
import type { AvatarProps } from '../types';

export const BENCH_TOP = 304;

export function Bench({ width }: AvatarProps) {
  return (
    <>
      <ellipse cx={width / 2} cy={420} rx={width / 2} ry={6} fill="#1d5e24" opacity=".32" filter="url(#soft)" />
      {/* the oak */}
      <path d="M44 420 C 46 400, 45 380, 47 360 L 55 360 C 56 380, 55 400, 58 420 Z" fill="#8a5431" />
      <path d="M48 372 C 42 366, 38 362, 34 356 M54 368 C 60 362, 64 360, 68 354" stroke="#8a5431" strokeWidth={3} fill="none" strokeLinecap="round" />
      <g filter="url(#lift)" fill="url(#leaf)">
        <circle cx={26} cy={360} r={13} />
        <circle cx={70} cy={356} r={13} />
        <circle cx={34} cy={344} r={18} />
        <circle cx={60} cy={340} r={19} />
        <circle cx={46} cy={326} r={22} />
      </g>
      <ellipse cx={38} cy={318} rx={9} ry={5} fill="#ffffff" opacity={0.22} />
      {/* the bench */}
      <g filter="url(#lift)">
        <rect x={8} y={404} width={3} height={16} rx={1} fill="#4d5c72" />
        <rect x={37} y={404} width={3} height={16} rx={1} fill="#4d5c72" />
        <rect x={9} y={388} width={2.4} height={17} rx={1} fill="#4d5c72" />
        <rect x={36.6} y={388} width={2.4} height={17} rx={1} fill="#4d5c72" />
        <rect x={4} y={402} width={40} height={4.4} rx={1.6} fill="#c9935e" />
        <rect x={5} y={390} width={38} height={4} rx={1.4} fill="#d9a26b" />
        <rect x={5} y={396} width={38} height={3.6} rx={1.4} fill="#c9935e" />
      </g>
      {/* robin */}
      <g className={styles.hopBird}>
        <path d="M23 387 L18.5 385.5 L19.5 388.5 Z" fill="#6b4a2e" />
        <ellipse cx={26} cy={386} rx={4.2} ry={3.4} fill="#8a6a4a" />
        <ellipse cx={27.6} cy={386.8} rx={2.4} ry={2.2} fill="#ff7a4a" />
        <circle cx={29.4} cy={382.6} r={2.4} fill="#8a6a4a" />
        <circle cx={30.2} cy={382.2} r={0.6} fill="#1b2433" />
        <path d="M31.6 382.8 L33.4 383.4 L31.6 383.8 Z" fill="#ffb02e" />
      </g>
      {/* tulips */}
      {[62, 68, 74].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 420 V411`} stroke="#3f9d3c" strokeWidth={1.4} />
          <path d={`M${x - 2.6} 411 Q${x - 2.6} 406 ${x} 405 Q${x + 2.6} 406 ${x + 2.6} 411 Z`} fill={['#ff6b8a', '#ffd34d', '#ff6b8a'][i]} />
        </g>
      ))}
    </>
  );
}
