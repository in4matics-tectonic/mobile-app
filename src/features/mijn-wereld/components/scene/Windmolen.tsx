// ENERGIE: windmill with spinning blades.

import styles from '../island.module.css';

const BLADE = 'M0 0 C -4 -12, -3 -30, 0 -38 C 3 -30, 4 -12, 0 0 Z';

export function Windmolen() {
  return (
    <>
      <ellipse cx="286" cy="150" rx="16" ry="5" fill="#1d5e24" opacity=".35" filter="url(#soft)" />
      <path d="M281 150 L284 74 L288 74 L291 150 Z" fill="#f4f7fb" filter="url(#lift)" />
      <path d="M286 150 L288 74 L291 150 Z" fill="#cdd8e4" />
      <g transform="translate(286 72)">
        <g className={styles.blades}>
          <path d={BLADE} fill="#fff" filter="url(#lift)" />
          <path d={BLADE} fill="#fff" transform="rotate(120)" filter="url(#lift)" />
          <path d={BLADE} fill="#fff" transform="rotate(240)" filter="url(#lift)" />
        </g>
        <circle r="5" fill="#0a5fb4" />
        <circle r="2" cx="-1.5" cy="-1.5" fill="#8fd0ff" />
      </g>
    </>
  );
}
