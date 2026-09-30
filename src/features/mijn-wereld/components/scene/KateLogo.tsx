// Kate floating above the island. Uses <symbol id="kateLogo"> from SceneDefs.
// Tapping her (or Enter / Space) opens the chat with Kate.

import type { KeyboardEvent } from 'react';

import styles from '../island.module.css';

export function KateOrb({ onOpen }: { onOpen: () => void }) {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen();
    }
  };
  return (
    <g className={styles.kateButton} tabIndex={0} role="button" aria-label="Chat met Kate" onClick={onOpen} onKeyDown={onKeyDown}>
      <g className={styles.kateBob}>
        <g transform="translate(36 44)">
          <ellipse cx="0" cy="30" rx="14" ry="3" fill="#0b2a4a" opacity=".15" filter="url(#soft)" />
          <circle className={styles.kateRing} r="25" fill="none" strokeWidth="2.5" />
          <use href="#kateLogo" x="-22" y="-22" width="44" height="44" filter="url(#lift)" />
        </g>
      </g>
    </g>
  );
}
