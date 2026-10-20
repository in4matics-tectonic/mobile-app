// household: the customer, their partner, and the baby Kate guesses (dashed) or that's confirmed.
// Phase-1 figures, scaled up and positioned by household size, with arms that wave at the end of the fly-in.
// No household data in the backend yet (Q1).

import styles from '../../street.module.css';
import type { AvatarProps } from '../types';

const K = 2;
/** Phase-1 figures stand on y 196. */
const BASE = 196;

export const HOUSEHOLD_TOP = 420 - 48 * K;

/** An arm hanging from the shoulder at `x`; it waves outward (away from the other adult) when asked. */
function Arm({ x, y, sleeve, wave, side }: { x: number; y: number; sleeve: string; wave: boolean; side: 'left' | 'right' }) {
  const waveClass = side === 'left' ? styles.waveArmL : styles.waveArm;
  return (
    <g className={wave ? waveClass : undefined}>
      <rect x={x - 1.7} y={y} width="3.4" height="12" rx="1.7" fill={sleeve} />
      <circle cx={x} cy={y + 12.4} r="1.9" fill="url(#skin)" />
    </g>
  );
}

function Adult({ x, variant, wave }: { x: number; variant: 'a' | 'b'; wave: boolean }) {
  if (variant === 'a') {
    return (
      <g transform={`translate(${x} ${BASE})`} filter="url(#lift)">
        <rect x="-4.5" y="-11" width="4" height="11" rx="2" fill="#2b3a55" />
        <rect x=".5" y="-11" width="4" height="11" rx="2" fill="#2b3a55" />
        <Arm x={-8} y={-25.5} sleeve="#2f7fd6" wave={wave} side="left" />
        <Arm x={8} y={-25.5} sleeve="#2f7fd6" wave={false} side="right" />
        <rect x="-7" y="-27" width="14" height="18" rx="6" fill="url(#shirtT)" />
        <circle cy="-34" r="7.5" fill="url(#skin)" />
        <path d="M-7.5 -35 a7.5 7.5 0 0 1 15 0 q-3 -3 -8 -2 q-4 1 -7 2z" fill="#5a3a22" />
        <g className={styles.blink}>
          <circle cx="-2.6" cy="-33.5" r="1" fill="#1b2433" />
          <circle cx="2.6" cy="-33.5" r="1" fill="#1b2433" />
        </g>
        <path d="M-2 -30.5 q2 1.4 4 0" stroke="#8a4a2a" strokeWidth=".9" fill="none" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${BASE})`} filter="url(#lift)">
      <rect x="-4" y="-10" width="3.6" height="10" rx="1.8" fill="#3b2f4a" />
      <rect x=".4" y="-10" width="3.6" height="10" rx="1.8" fill="#3b2f4a" />
      <Arm x={-7.4} y={-24.5} sleeve="#e86f4f" wave={false} side="left" />
      <Arm x={7.4} y={-24.5} sleeve="#e86f4f" wave={wave} side="right" />
      <path d="M-7 -9 L-6 -24 q0 -3 6 -3 q6 0 6 3 L7 -9 Z" fill="url(#shirtL)" />
      <path d="M-8 -33 q0 -9 8 -9 q8 0 8 9 l1 9 q-3 1 -4 -1 l-5 0 l-5 0 q-1 2 -4 1z" fill="#8a3b1f" />
      <circle cy="-32" r="7" fill="url(#skin)" />
      <path d="M-7 -33 q2 -7 7 -7 q5 0 7 7 q-5 -4 -14 0z" fill="#8a3b1f" />
      <g className={styles.blink} style={{ animationDelay: '-1.7s' }}>
        <circle cx="-2.4" cy="-31.5" r="1" fill="#1b2433" />
        <circle cx="2.4" cy="-31.5" r="1" fill="#1b2433" />
      </g>
      <path d="M-2 -28.6 q2 1.4 4 0" stroke="#8a4a2a" strokeWidth=".9" fill="none" strokeLinecap="round" />
    </g>
  );
}

export function Household({ width, household, wave }: AvatarProps) {
  const two = household.adults === 2;
  const xs = two ? [165, 184] : [176];
  const babyX = two ? 201 : 192;
  const cx = (xs[0] + (household.pendingBaby || household.children ? babyX : xs[xs.length - 1])) / 2;
  return (
    <g transform={`translate(${width / 2 - cx * K} ${420 - BASE * K}) scale(${K})`}>
      <ellipse cx={cx} cy={BASE} rx={two ? 30 : 20} ry="5" fill="#1d5e24" opacity=".35" filter="url(#soft)" />
      {household.children > 0 && (
        <path
          d={`M${cx} 142 c-3-5-10-3-9 2 c1 4 9 8 9 8 s8-4 9-8 c1-5-6-7-9-2z`}
          fill="#ff5c8a"
          filter="url(#lift)"
        />
      )}
      <g className={wave ? styles.hop : undefined}>
        <Adult x={xs[0]} variant="a" wave={!!wave} />
        {two && <Adult x={xs[1]} variant="b" wave={!!wave} />}
      </g>
      {household.pendingBaby && (
        <g className={`${styles.breathe} ${styles.keep}`} transform={`translate(${babyX} ${BASE})`}>
          <rect x="-4.5" y="-11" width="9" height="11" rx="4" fill="#fff" fillOpacity=".35" stroke="#fff" strokeWidth="1.4" strokeDasharray="2 1.8" />
          <circle cy="-16" r="5.2" fill="#fff" fillOpacity=".35" stroke="#fff" strokeWidth="1.4" strokeDasharray="2 1.8" />
        </g>
      )}
      {household.children > 0 && (
        <g transform={`translate(${babyX} ${BASE})`} filter="url(#lift)">
          <rect x="-4.5" y="-11" width="9" height="11" rx="4" fill="url(#onesie)" />
          <circle cy="-16" r="5.2" fill="url(#skin)" />
          <path d="M-1 -21 q1 -2 2 0" stroke="#8a4a2a" strokeWidth="1" fill="none" />
          <circle cx="-1.7" cy="-16" r=".8" fill="#1b2433" />
          <circle cx="1.7" cy="-16" r=".8" fill="#1b2433" />
        </g>
      )}
    </g>
  );
}
