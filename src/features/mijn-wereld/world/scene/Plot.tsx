// A plot: an ecosystem with only tips (D20). An empty lot with a low fence and a Kate signpost.
// Shared by every plot; the sign uses the backend cluster name.

import styles from '../street.module.css';
import { labelFont } from './font';

export const PLOT_TOP = 330;

/** "Energie en duurzaamheid" → "Energie": the sign is small. */
const short = (name: string) => name.split(' · ')[0].split(/\s+en\s+/)[0];

export function Plot({ width, name }: { width: number; name: string }) {
  const text = `${short(name)}?`;
  const boardW = Math.max(54, text.length * 6.6 + 18);
  const signX = width * 0.62;
  const posts = Math.max(3, Math.floor(width / 18));
  return (
    <>
      <ellipse cx={width / 2} cy={420} rx={width / 2 + 4} ry={9} fill="#b6ee8f" />
      <ellipse cx={width / 2} cy={419} rx={width / 2 - 6} ry={6} fill="#c9f5a6" />
      {/* low fence */}
      <g>
        <rect x={2} y={404} width={width - 4} height={3} rx={1.5} fill="#c9935e" />
        <rect x={2} y={411} width={width - 4} height={3} rx={1.5} fill="#c9935e" />
        {Array.from({ length: posts }, (_, i) => (
          <rect key={i} x={4 + (i * (width - 12)) / (posts - 1)} y={398} width={4} height={22} rx={1.5} fill="#b07a45" />
        ))}
      </g>
      {/* seedlings: this is where the world can grow */}
      {[0.16, 0.3, 0.42].map((f, i) => (
        <g key={f} className={styles.sway} style={{ animationDelay: `${-i * 1.1}s` }}>
          <path d={`M${width * f} 419 q-0.5 -6 0.5 -11`} stroke="#3f9d3c" strokeWidth={1.6} fill="none" strokeLinecap="round" />
          <path d={`M${width * f + 0.4} 410 q-6 -1 -7 -5 q5 -1 7 5 Z`} fill="#6fd052" />
          <path d={`M${width * f + 0.4} 409 q5 -3 7 -1 q-3 4 -7 1 Z`} fill="#8be06a" />
        </g>
      ))}
      {/* Kate signpost */}
      <rect x={signX - 2} y={356} width={4} height={64} rx={2} fill="#8a6a4a" />
      <g className={styles.sign} filter="url(#lift)">
        <rect x={signX - boardW / 2} y={PLOT_TOP + 24} width={boardW} height={26} rx={8} fill="#ffffff" />
        <text x={signX + 8} y={PLOT_TOP + 41.5} textAnchor="middle" fontSize={11.5} fill="#12305a" {...labelFont}>
          {text}
        </text>
      </g>
      <use href="#kateLogo" x={signX - boardW / 2 - 6} y={PLOT_TOP + 22} width={22} height={22} />
      <path className={styles.sparkleIdle} d={`M${signX + boardW / 2} ${PLOT_TOP + 16} l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 Z`} fill="#ffd34d" />
    </>
  );
}
