// GEZIN: Tom & Lien, plus the baby that appears as Kate's guess (dashed) and after confirmation.

import styles from '../island.module.css';

export function Gezin({
  ghost,
  baby,
}: {
  /** Dashed, breathing figure while Kate asks. */
  ghost: boolean;
  /** Real baby and a heart after confirmation. */
  baby: boolean;
}) {
  return (
    <>
      <ellipse cx="172" cy="196" rx="30" ry="5" fill="#1d5e24" opacity=".35" filter="url(#soft)" />
      <path
        className={styles.fade}
        style={{ opacity: baby ? 1 : 0 }}
        d="M170 142 c-3-5-10-3-9 2 c1 4 9 8 9 8 s8-4 9-8 c1-5-6-7-9-2z"
        fill="#ff5c8a"
        filter="url(#lift)"
      />
      {/* Tom */}
      <g transform="translate(160 196)" filter="url(#lift)">
        <rect x="-4.5" y="-11" width="4" height="11" rx="2" fill="#2b3a55" />
        <rect x=".5" y="-11" width="4" height="11" rx="2" fill="#2b3a55" />
        <rect x="-7" y="-27" width="14" height="18" rx="6" fill="url(#shirtT)" />
        <circle cy="-34" r="7.5" fill="url(#skin)" />
        <path d="M-7.5 -35 a7.5 7.5 0 0 1 15 0 q-3 -3 -8 -2 q-4 1 -7 2z" fill="#5a3a22" />
        <circle cx="-2.6" cy="-33.5" r="1" fill="#1b2433" />
        <circle cx="2.6" cy="-33.5" r="1" fill="#1b2433" />
        <path d="M-2 -30.5 q2 1.4 4 0" stroke="#8a4a2a" strokeWidth=".9" fill="none" strokeLinecap="round" />
      </g>
      {/* Lien */}
      <g transform="translate(180 196)" filter="url(#lift)">
        <rect x="-4" y="-10" width="3.6" height="10" rx="1.8" fill="#3b2f4a" />
        <rect x=".4" y="-10" width="3.6" height="10" rx="1.8" fill="#3b2f4a" />
        <path d="M-7 -9 L-6 -24 q0 -3 6 -3 q6 0 6 3 L7 -9 Z" fill="url(#shirtL)" />
        <path d="M-8 -33 q0 -9 8 -9 q8 0 8 9 l1 9 q-3 1 -4 -1 l-5 0 l-5 0 q-1 2 -4 1z" fill="#8a3b1f" />
        <circle cy="-32" r="7" fill="url(#skin)" />
        <path d="M-7 -33 q2 -7 7 -7 q5 0 7 7 q-5 -4 -14 0z" fill="#8a3b1f" />
        <circle cx="-2.4" cy="-31.5" r="1" fill="#1b2433" />
        <circle cx="2.4" cy="-31.5" r="1" fill="#1b2433" />
        <path d="M-2 -28.6 q2 1.4 4 0" stroke="#8a4a2a" strokeWidth=".9" fill="none" strokeLinecap="round" />
      </g>
      {/* Kate's guess: dashed baby */}
      <g className={styles.fade} style={{ opacity: ghost ? 1 : 0 }}>
        <g className={styles.ghostBaby} transform="translate(197 196)">
          <rect
            x="-4.5"
            y="-11"
            width="9"
            height="11"
            rx="4"
            fill="#fff"
            fillOpacity=".35"
            stroke="#fff"
            strokeWidth="1.4"
            strokeDasharray="2 1.8"
          />
          <circle
            cy="-16"
            r="5.2"
            fill="#fff"
            fillOpacity=".35"
            stroke="#fff"
            strokeWidth="1.4"
            strokeDasharray="2 1.8"
          />
        </g>
      </g>
      {/* Confirmed baby */}
      <g className={styles.fade} style={{ opacity: baby ? 1 : 0 }} transform="translate(197 196)" filter="url(#lift)">
        <rect x="-4.5" y="-11" width="9" height="11" rx="4" fill="url(#onesie)" />
        <circle cy="-16" r="5.2" fill="url(#skin)" />
        <path d="M-1 -21 q1 -2 2 0" stroke="#8a4a2a" strokeWidth="1" fill="none" />
        <circle cx="-1.7" cy="-16" r=".8" fill="#1b2433" />
        <circle cx="1.7" cy="-16" r=".8" fill="#1b2433" />
      </g>
    </>
  );
}
