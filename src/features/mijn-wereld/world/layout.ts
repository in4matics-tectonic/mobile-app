// World geometry (project-info.md 4.2, 4.3). The world draws in world units: 600 tall, scaled to the band
// height, so 1 unit ≈ 1px in the phone frame. Starting values, to tune by eye.

import { CATEGORIES, ZONE_ORDER } from './categories';
import type { Place, ZoneId } from './types';

export const WORLD_H = 600;
/** Places stand on this line. */
export const GROUND_Y = 420;
export const ROAD = { top: 420, bottom: 475 } as const;
/** The header overlays roughly y 0–110; places stay below this. */
export const SAFE_TOP = 180;

export const ZONE_PAD = 40;
export const PLACE_GAP = 24;
/** Road sign between two land zones. */
export const SIGN_W = 70;
/** Open sea before `away`, so the island reads as far away. */
export const SEA_W = 320;

/** How fast each layer scrolls relative to the street. */
export const PARALLAX = { clouds: 0.3, plane: 0.6, back: 0.5, main: 1, foreground: 1.15 } as const;

export interface PositionedPlace {
  place: Place;
  x: number;
  width: number;
}

export interface ZoneSpan {
  id: ZoneId;
  x0: number;
  x1: number;
}

export interface Connector {
  kind: 'sign' | 'sea';
  x: number;
  width: number;
  /** The zone the connector leads into. */
  to: ZoneId;
}

export interface WorldLayout {
  items: PositionedPlace[];
  zones: ZoneSpan[];
  connectors: Connector[];
  width: number;
}

/** Same places in, same layout out: stable, so arrivals only shift what's to their right. */
export function layoutWorld(places: Place[], viewportUnits = 390): WorldLayout {
  const items: PositionedPlace[] = [];
  const zones: ZoneSpan[] = [];
  const connectors: Connector[] = [];
  let x = 0;

  for (const zone of ZONE_ORDER) {
    const inZone = places.filter((p) => p.zone === zone);
    // Growth rule: a zone renders once it holds a place or plot.
    if (!inZone.length) continue;
    if (zones.length) {
      const width = zone === 'away' ? SEA_W : SIGN_W;
      connectors.push({ kind: zone === 'away' ? 'sea' : 'sign', x, width, to: zone });
      x += width;
    }
    const x0 = x;
    x += ZONE_PAD;
    inZone.forEach((place, i) => {
      const width = CATEGORIES[place.id].width;
      items.push({ place, x, width });
      x += width + (i < inZone.length - 1 ? PLACE_GAP : 0);
    });
    x += ZONE_PAD;
    zones.push({ id: zone, x0, x1: x });
  }

  // A little road past the last zone, so the street never ends at the screen edge.
  return { items, zones, connectors, width: Math.max(x + 60, viewportUnits) };
}
