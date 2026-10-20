// Everything around the places: clouds, hills and skyline, the road, the sea and the island's land,
// connectors between zones, trees and waves, the plane. World units (layout.ts).
//
// Layers scroll at their own speed (PARALLAX). A layer at factor f is shifted by scroll × (1 − f), so a
// world x maps to layer x `vw/2 + f·(x − vw/2)`: drawn there, it passes the screen centre together with x.

import styles from '../street.module.css';
import { ZONE_LABELS } from '../categories';
import { PARALLAX, type WorldLayout } from '../layout';
import type { ZoneId } from '../types';
import { labelFont } from './font';

/** `flat`: reduced motion stops parallax, so every layer maps 1:1. */
const at = (f: number, vw: number, flat?: boolean) => (x: number) => (flat ? x : vw / 2 + f * (x - vw / 2));

interface LayerProps {
  layout: WorldLayout;
  vw: number;
  flat?: boolean;
}

const SEA_TOP = 432;

/** Where the mainland ends and where the island's land sits. */
export function landmarks(layout: WorldLayout) {
  const sea = layout.connectors.find((c) => c.kind === 'sea');
  const away = layout.zones.find((z) => z.id === 'away');
  return { landEnd: sea ? sea.x + 30 : layout.width, sea, away };
}

function Cloud({ x, y, k = 1 }: { x: number; y: number; k?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} filter="url(#lift)">
      <g fill="url(#cloudG)">
        <ellipse cx={0} cy={10} rx={46} ry={20} />
        <circle cx={-20} cy={0} r={20} />
        <circle cx={14} cy={-6} r={25} />
      </g>
    </g>
  );
}

export function Clouds({ layout, vw, flat }: LayerProps) {
  const map = at(PARALLAX.clouds, vw, flat);
  const from = map(0) - 80;
  const to = map(layout.width) + vw;
  const clouds = [];
  for (let x = from, i = 0; x < to; x += 230, i++) {
    clouds.push(<Cloud key={i} x={x + (i % 3) * 40} y={[150, 96, 210, 128][i % 4]} k={[1, 0.8, 0.65, 0.9][i % 4]} />);
  }
  return (
    <g className={styles.cloud} aria-hidden>
      {clouds}
    </g>
  );
}

function hills(x0: number, x1: number, base: number, height: number, step: number) {
  let d = `M${x0} 430 L${x0} ${base}`;
  for (let x = x0, i = 0; x < x1; x += step, i++) {
    const h = height * (i % 2 ? 0.7 : 1);
    d += ` Q ${x + step / 2} ${base - h} ${x + step} ${base}`;
  }
  return `${d} L${x1 + step} 430 Z`;
}

export function BackLayer({ layout, vw, flat }: LayerProps) {
  const map = at(PARALLAX.back, vw, flat);
  const { landEnd } = landmarks(layout);
  const town = layout.zones.find((z) => z.id === 'town');
  const x0 = map(0) - vw;
  const x1 = map(landEnd);
  return (
    <g aria-hidden>
      <path d={hills(x0, x1, 400, 70, 260)} fill="url(#hillFar)" />
      {town && <Skyline x0={map(town.x0)} x1={map(town.x1)} />}
      <path d={hills(x0 + 90, x1, 412, 46, 200)} fill="url(#hill)" />
    </g>
  );
}

function Skyline({ x0, x1 }: { x0: number; x1: number }) {
  const heights = [96, 140, 74, 120, 160, 88, 130, 104];
  const buildings = [];
  for (let x = x0 - 40, i = 0; x < x1 + 40; x += 34, i++) {
    const h = heights[i % heights.length];
    buildings.push(<rect key={i} x={x} y={404 - h} width={30} height={h} rx={3} fill="url(#skyline)" />);
    if (i % 3 === 1) buildings.push(<rect key={`w${i}`} x={x + 8} y={404 - h + 12} width={14} height={h - 24} rx={2} fill="#cfe3f6" opacity={0.6} />);
  }
  return <g opacity={0.9}>{buildings}</g>;
}

export function Ground({ layout, busFrom, busTo }: { layout: WorldLayout; busFrom?: number; busTo?: number }) {
  const { landEnd, sea, away } = landmarks(layout);
  const w = layout.width;
  return (
    <g aria-hidden>
      {sea && (
        <>
          <rect x={sea.x} y={SEA_TOP} width={w - sea.x + 400} height={200} fill="url(#sea)" />
          <path d={`M${sea.x} ${SEA_TOP + 2} H${w + 400}`} stroke="#ffffff" strokeOpacity={0.5} strokeWidth={2} />
        </>
      )}
      {/* mainland: verge, road, lawn, and a beach where it meets the sea */}
      <rect x={-400} y={398} width={landEnd + 400} height={32} fill="url(#verge)" />
      <rect x={-400} y={426} width={landEnd + 400} height={44} fill="url(#asphalt)" />
      <path d={`M-400 448 H${landEnd - 20}`} stroke="#f4f7fb" strokeWidth={3} strokeDasharray="18 16" />
      <rect x={-400} y={468} width={landEnd + 400} height={140} fill="url(#lawn)" />
      <rect x={-400} y={466} width={landEnd + 400} height={4} fill="#c9d5e3" />
      {sea && <path d={`M${landEnd - 40} 396 C ${landEnd} 400, ${landEnd + 20} 440, ${landEnd + 60} 620 L${landEnd - 40} 620 Z`} fill="url(#sand)" />}
      {/* the island's land across the sea */}
      {away && (
        <>
          <path
            d={`M${away.x0} 470 C ${away.x0 + 16} 420, ${away.x0 + 30} 410, ${away.x0 + 60} 410 L${away.x1 - 60} 410 C ${away.x1 - 30} 410, ${away.x1 - 16} 420, ${away.x1} 470 C ${away.x1 - 60} 490, ${away.x0 + 60} 490, ${away.x0} 470 Z`}
            fill="url(#sand)"
          />
          <rect x={away.x0 + 44} y={406} width={away.x1 - away.x0 - 88} height={22} rx={11} fill="url(#verge)" />
        </>
      )}
      {layout.connectors.map((c) => (c.kind === 'sign' ? <ZoneSign key={c.to} x={c.x + c.width / 2} to={c.to} /> : <Boat key={c.to} x={c.x + c.width / 2} />))}
      {busFrom !== undefined && busTo !== undefined && <Bus from={busFrom} to={busTo} />}
    </g>
  );
}

function ZoneSign({ x, to }: { x: number; to: ZoneId }) {
  const text = ZONE_LABELS[to];
  const w = text.length * 7 + 20;
  return (
    <g>
      <rect x={x - 2} y={372} width={4} height={50} rx={2} fill="#8a6a4a" />
      <path d={`M${x - w / 2} 366 H${x + w / 2 - 4} L${x + w / 2 + 6} 377 L${x + w / 2 - 4} 388 H${x - w / 2} Z`} fill="#1f9d55" stroke="#fff" strokeWidth={2} filter="url(#lift)" />
      <text x={x - 3} y={381.5} textAnchor="middle" fontSize={11.5} fill="#fff" {...labelFont}>
        {text}
      </text>
    </g>
  );
}

function Boat({ x }: { x: number }) {
  return (
    <g className={styles.boat}>
      <g transform={`translate(${x} 470)`} filter="url(#lift)">
        <path d="M-26 0 L26 0 L18 12 L-18 12 Z" fill="#f4f7fb" />
        <path d="M-26 0 L26 0 L24 4 L-24 4 Z" fill="#ff6b4a" />
        <rect x={-1} y={-38} width={2.4} height={38} fill="#5a6b82" />
        <path d="M1.4 -36 L22 -4 L1.4 -4 Z" fill="#ffffff" />
        <path d="M-1 -30 L-16 -4 L-1 -4 Z" fill="#cfe3f6" />
      </g>
    </g>
  );
}

function Bus({ from, to }: { from: number; to: number }) {
  return (
    <g className={styles.bus} style={{ '--from': `${from}px`, '--to': `${to}px` } as object}>
      <g transform="translate(0 422)" filter="url(#lift)">
        <rect x={0} y={0} width={92} height={34} rx={7} fill="#ffdd00" />
        <rect x={0} y={24} width={92} height={10} rx={3} fill="#1d1d1b" />
        {[8, 26, 44, 62].map((x) => (
          <rect key={x} x={x} y={6} width={14} height={12} rx={2} fill="#cfefff" />
        ))}
        <rect x={80} y={6} width={9} height={18} rx={2} fill="#a8dcff" />
        <circle cx={20} cy={36} r={6} fill="#1b2433" />
        <circle cx={72} cy={36} r={6} fill="#1b2433" />
      </g>
    </g>
  );
}

export function Foreground({ layout, vw, flat }: LayerProps) {
  const map = at(PARALLAX.foreground, vw, flat);
  const { landEnd, sea } = landmarks(layout);
  const trees = [];
  for (let x = 60, i = 0; x < landEnd - 80; x += 210, i++) {
    trees.push(<Tree key={i} x={map(x + (i % 2) * 60)} k={[1, 0.8, 1.15][i % 3]} />);
  }
  const waves = [];
  if (sea) {
    for (let x = sea.x + 60, i = 0; x < layout.width + 200; x += 110, i++) {
      waves.push(
        <path key={i} d={`M${map(x)} ${[500, 540, 520][i % 3]} q8 -6 16 0 q8 6 16 0`} stroke="#ffffff" strokeOpacity={0.7} strokeWidth={2.4} fill="none" strokeLinecap="round" />,
      );
    }
  }
  return (
    <g aria-hidden>
      {trees}
      {waves.length > 0 && <g className={styles.wave}>{waves}</g>}
    </g>
  );
}

function Tree({ x, k }: { x: number; k: number }) {
  return (
    <g transform={`translate(${x} 528) scale(${k})`}>
      <ellipse cx={0} cy={0} rx={20} ry={5} fill="#1d5e24" opacity={0.3} />
      <rect x={-4} y={-30} width={8} height={30} rx={3} fill="#8a5431" />
      <g filter="url(#lift)" fill="url(#leaf)">
        <circle cx={-12} cy={-40} r={16} />
        <circle cx={12} cy={-42} r={17} />
        <circle cx={0} cy={-58} r={19} />
      </g>
    </g>
  );
}

/** The plane crosses its lane over the away zone; dashed while Brussels Airport is only known. */
export function Plane({ layout, vw, flat, ghost }: LayerProps & { ghost: boolean }) {
  const map = at(PARALLAX.plane, vw, flat);
  const { sea, away } = landmarks(layout);
  if (!away) return null;
  const from = map((sea?.x ?? away.x0) - 200);
  const to = map(away.x1 + 300);
  return (
    <g className={ghost ? `${styles.ghost} ${styles.breathe}` : undefined}>
      <g className={styles.plane} style={{ '--from': `${from}px`, '--to': `${to}px` } as object}>
        <g transform="translate(0 132)" filter="url(#lift)">
          <path d="M0 0 C 0 -6, 6 -9, 14 -9 L 70 -9 C 80 -9, 88 -5, 92 0 C 88 5, 80 8, 70 8 L 14 8 C 6 8, 0 5, 0 0 Z" fill="#ffffff" />
          <path d="M6 -8 L 0 -26 L 10 -26 L 22 -8 Z" fill="#0b2c5a" />
          <path d="M40 -4 L 30 -30 L 40 -30 L 58 -4 Z" fill="#dfe7f1" />
          <path d="M40 4 L 32 22 L 42 22 L 56 4 Z" fill="#c9d5e3" />
          {[24, 32, 40, 48, 56, 64].map((x) => (
            <circle key={x} cx={x} cy={-2} r={1.8} fill="#7cc8f0" />
          ))}
          <path d="M78 -6 C 84 -6, 88 -3, 90 0 L 80 0 Z" fill="#7cc8f0" />
        </g>
      </g>
    </g>
  );
}
