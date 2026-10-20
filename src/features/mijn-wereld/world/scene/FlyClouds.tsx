// The cloud bank the fly-in starts in (4.7): while the world loads the camera holds here and the clouds drift;
// then they part outward from the centre, the near ones fastest, as the camera dives through them.
// Each cloud is its own HTML layer, so the browser composites the motion instead of repainting the street.

import type { Ref } from 'react';

import styles from '../street.module.css';
import { CLOUD_VIEWBOX, CloudShape, type CloudShapeId } from './Cloud';

export interface FlyCloud {
  /** Position and width in % of the band; height follows the shape. */
  left: number;
  top: number;
  width: number;
  shape: CloudShapeId;
  /** 0 far, 1 middle, 2 near: near clouds are bigger, brighter and leave first and fastest. */
  depth: 0 | 1 | 2;
}

export const FLY_CLOUDS: FlyCloud[] = [
  { left: -12, top: 10, width: 64, shape: 'c', depth: 0 },
  { left: 46, top: 30, width: 62, shape: 'b', depth: 0 },
  { left: 2, top: 74, width: 58, shape: 'a', depth: 0 },
  { left: 34, top: -4, width: 86, shape: 'b', depth: 1 },
  { left: -30, top: 30, width: 86, shape: 'c', depth: 1 },
  { left: 38, top: 50, width: 82, shape: 'a', depth: 1 },
  { left: -38, top: -8, width: 124, shape: 'a', depth: 2 },
  { left: 22, top: 16, width: 120, shape: 'b', depth: 2 },
  { left: -44, top: 46, width: 128, shape: 'c', depth: 2 },
  { left: 18, top: 66, width: 124, shape: 'a', depth: 2 },
];

/** Keyframe timing per depth: near clouds part first and rush past; far ones drift off a little later, but
 * fade early (`hold`: share of the time at full opacity) so none lingers over the street as it comes into view. */
export const PART = [
  { delay: 340, duration: 1250, scale: 1.5, travel: 80, hold: 0.25 },
  { delay: 220, duration: 1150, scale: 1.9, travel: 100, hold: 0.4 },
  { delay: 100, duration: 1000, scale: 2.5, travel: 120, hold: 0.55 },
] as const;

/** Outward direction from the band's centre, in % of the cloud's own size. */
export function partVector(c: FlyCloud, bandRatio: number) {
  const cx = c.left + c.width / 2 - 50;
  // The shape is about 0.58 as tall as wide; top is in % of the band height.
  const cy = c.top + (c.width * 0.58 * bandRatio) / 2 - 50;
  const len = Math.hypot(cx, cy) || 1;
  const t = PART[c.depth].travel;
  return { x: (cx / len) * t, y: (cy / len) * t * 0.7 };
}

export function FlyClouds({ cloudsRef }: { cloudsRef: Ref<HTMLDivElement> }) {
  return (
    <div ref={cloudsRef} className={styles.flyClouds} aria-hidden>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="flyCloudBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset=".62" stopColor="#f3f8fd" />
            <stop offset="1" stopColor="#d3e3f3" />
          </linearGradient>
        </defs>
      </svg>
      <div className={styles.flyHaze} data-haze />
      {FLY_CLOUDS.map((c, i) => (
        <div
          key={i}
          data-cloud={i}
          className={styles.flyCloud}
          style={{ left: `${c.left}%`, top: `${c.top}%`, width: `${c.width}%`, zIndex: c.depth, opacity: c.depth === 0 ? 0.9 : 1 }}>
          <div
            className={styles.flyPuff}
            style={{ animationDelay: `${-i * 1.3}s`, animationDuration: `${7 + c.depth * 1.5}s`, animationDirection: i % 2 ? 'alternate-reverse' : 'alternate' }}>
            <svg viewBox={CLOUD_VIEWBOX} width="100%" style={{ display: 'block', overflow: 'visible' }}>
              <CloudShape shape={c.shape} body="flyCloudBody" shade={c.depth === 2 ? '#c3d7ec' : '#cfe0f1'} />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
