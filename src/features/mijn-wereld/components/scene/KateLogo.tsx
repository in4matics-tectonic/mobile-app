// Kate floating above the island. Uses <symbol id="kateLogo"> from SceneDefs.

import styles from '../island.module.css';

export function KateOrb() {
  return (
    <g className={styles.kateBob}>
      <g transform="translate(36 44)">
        <ellipse cx="0" cy="30" rx="14" ry="3" fill="#0b2a4a" opacity=".15" filter="url(#soft)" />
        <use href="#kateLogo" x="-22" y="-22" width="44" height="44" filter="url(#lift)" />
      </g>
    </g>
  );
}
