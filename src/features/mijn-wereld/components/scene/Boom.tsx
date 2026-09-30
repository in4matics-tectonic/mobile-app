// SPAREN: coin tree. The swing appears once everything for the birth is arranged.

import styles from '../island.module.css';

export function Boom({ showSwing }: { showSwing: boolean }) {
  return (
    <>
      <ellipse cx="66" cy="206" rx="28" ry="7" fill="#1d5e24" opacity=".35" filter="url(#soft)" />
      <path d="M61 206 C 63 190, 62 180, 60 170 L72 170 C 70 180, 69 190, 71 206 Z" fill="#8a5431" />
      <g filter="url(#lift)" fill="url(#leaf)">
        <circle cx="52" cy="160" r="18" />
        <circle cx="80" cy="158" r="19" />
        <circle cx="66" cy="140" r="21" />
      </g>
      <g>
        <circle cx="54" cy="150" r="5" fill="url(#coin)" />
        <circle cx="76" cy="146" r="5" fill="url(#coin)" />
        <circle cx="68" cy="164" r="5" fill="url(#coin)" />
        <circle cx="86" cy="164" r="4.5" fill="url(#coin)" />
      </g>
      <g className={styles.fade} style={{ opacity: showSwing ? 1 : 0 }} aria-hidden={!showSwing}>
        <path d="M84 172 L84 196 M96 170 L96 196" stroke="#6e4024" strokeWidth="1.4" />
        <rect x="81" y="195" width="18" height="4" rx="2" fill="#ff8a66" />
      </g>
    </>
  );
}
