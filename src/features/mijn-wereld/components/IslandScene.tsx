'use dom';

// The island is an Expo DOM component: on web it renders inline as plain SVG (identical to the
// prototype, CSS animations included); on iOS/Android it runs in a lightweight webview.
// Props must stay serializable; onSelectDomain is a native action.

import { useEffect } from 'react';

import type { Domain, Phase } from '../state/types';
import styles from './island.module.css';
import { Auto } from './scene/Auto';
import { Boom } from './scene/Boom';
import { SceneDefs } from './scene/Defs';
import { EilandBasis, Wolken } from './scene/Eiland';
import { IN_NATIVE_WEBVIEW } from './scene/font';
import { Gezin } from './scene/Gezin';
import { Badge, Hotspot } from './scene/Hotspot';
import { Huis } from './scene/Huis';
import { KateOrb } from './scene/KateLogo';
import { Windmolen } from './scene/Windmolen';

const FONT_CSS =
  'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap';

export default function IslandScene({
  phase,
  familyLabel,
  verified,
  onSelectDomain,
}: {
  phase: Phase;
  familyLabel: string;
  verified: Partial<Record<Domain, boolean>>;
  onSelectDomain: (domain: Domain) => Promise<void> | void;
  dom?: import('expo/dom').DOMProps;
}) {
  useEffect(() => {
    if (!IN_NATIVE_WEBVIEW) return;
    document.body.style.margin = '0';
    document.body.style.background = 'transparent';
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONT_CSS;
    document.head.appendChild(link);
  }, []);

  const select = (domain: Domain) => {
    onSelectDomain(domain);
  };
  const familyWidth = familyLabel.length > 9 ? 94 : 76;

  return (
    <svg
      className={styles.scene}
      viewBox="0 0 360 300"
      role="img"
      aria-label="De wereld van Tom en Lien: hun huis, auto, energie, spaarboom en hun gezin">
      <SceneDefs />
      <Wolken />

      <g className={styles.float}>
        <EilandBasis />

        <Hotspot domain="wonen" label="Wonen" onSelect={select}>
          <Huis />
          <Badge
            x={76}
            y={52}
            width={72}
            text="Wonen"
            textX={104}
            check={verified.wonen ? { x: 136, y: 62 } : undefined}
          />
        </Hotspot>

        <Hotspot domain="energie" label="Energie" onSelect={select}>
          <Windmolen />
          <Badge x={252} y={158} width={66} text="Energie" textX={285} />
        </Hotspot>

        <Hotspot domain="sparen" label="Sparen" onSelect={select}>
          <Boom showSwing={phase === 'done'} />
          <Badge x={36} y={222} width={58} text="Sparen" textX={65} />
        </Hotspot>

        <Hotspot domain="gezin" label="Gezin" onSelect={select}>
          <Gezin ghost={phase === 'ask'} baby={phase === 'confirmed' || phase === 'done'} />
          <Badge x={170 - familyWidth / 2} y={228} width={familyWidth} text={familyLabel} textX={170} />
        </Hotspot>

        <Hotspot domain="mobiliteit" label="Mobiliteit" onSelect={select}>
          <Auto />
          <Badge
            x={214}
            y={232}
            width={90}
            text="Mobiliteit"
            textX={250}
            check={verified.mobiliteit ? { x: 292, y: 242 } : undefined}
          />
        </Hotspot>
      </g>

      <KateOrb />
    </svg>
  );
}
