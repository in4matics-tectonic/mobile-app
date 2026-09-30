// Floating island base (cliff, grass, path, pond) and the drifting clouds.

import styles from '../island.module.css';

const CLIFF =
  'M16 178 C 24 230, 90 262, 150 284 C 168 292, 192 292, 210 284 C 270 262, 336 230, 344 178 Z';

export function Wolken() {
  return (
    <>
      <g className={styles.cloud} filter="url(#lift)">
        <g fill="url(#cloudG)">
          <ellipse cx="190" cy="34" rx="26" ry="12" />
          <circle cx="178" cy="28" r="11" />
          <circle cx="198" cy="24" r="14" />
        </g>
      </g>
      <g className={styles.cloud} style={{ animationDuration: '30s' }} filter="url(#lift)">
        <g fill="url(#cloudG)" opacity=".9">
          <ellipse cx="330" cy="130" rx="20" ry="9" />
          <circle cx="322" cy="124" r="9" />
          <circle cx="337" cy="121" r="10" />
        </g>
      </g>
    </>
  );
}

export function EilandBasis() {
  return (
    <>
      <ellipse cx="180" cy="292" rx="70" ry="6" fill="#0b2a4a" opacity=".12" filter="url(#soft)" />
      <path d={CLIFF} fill="url(#cliff)" />
      <path d={CLIFF} fill="url(#cliffSide)" />
      <path
        d="M60 214 q10 8 22 6 M250 236 q14 -2 22 -12 M150 262 q12 6 26 2"
        stroke="#5b331c"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        opacity=".35"
      />
      <ellipse cx="180" cy="178" rx="166" ry="64" fill="#3a9436" />
      <ellipse cx="180" cy="172" rx="164" ry="62" fill="url(#grass)" />
      <path d="M40 150 Q 180 104 320 150" stroke="#fff" strokeOpacity=".28" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* path */}
      <path d="M122 162 C 140 190, 180 196, 238 212" stroke="#f4e3c1" strokeWidth="10" fill="none" strokeLinecap="round" opacity=".9" />
      {/* pond */}
      <ellipse cx="172" cy="214" rx="26" ry="10" fill="#2b8a3e" opacity=".5" />
      <ellipse cx="172" cy="212" rx="24" ry="9" fill="url(#water)" />
      <ellipse cx="164" cy="209" rx="7" ry="2" fill="#fff" opacity=".7" />
    </>
  );
}
